"use strict";

const _ = require("lodash");
const BlueBird = require("bluebird");

// sms todo: promisify or remove bluebird

const mapJobDocumentToJobObject = (jobDoc) => {
  return _.merge({id: jobDoc.attrs._id}, jobDoc.attrs.data);
};

const listJobs = (agenda) => {
  return BlueBird.promisify(agenda.jobs, {context: agenda})({$or: [
        {"data.deleted": false},
        {"data.deleted": {$exists: false}}]})
    .then((jobs) => {
      return jobs.map(mapJobDocumentToJobObject);
    });
};

const getJobById = (agenda, id) => {
  return new Promise((resolve, reject) => {
    agenda.jobs({_id: id, $or: [
        {"data.deleted": false}, {"data.deleted": {$exists: false}}]},
      (err, jobs) => {
        if (err) {
          return reject(err);
        }
        if (!_.size(jobs)) {
          return resolve();
        }
        return resolve(mapJobDocumentToJobObject(jobs[0]));
      });
  });
};

const createJob = (agenda, job) => {
  return new Promise((resolve, reject) => {
    const scheduled = (err, scheduledJob) => {
      if (err) {
        return reject(err);
      }
      return resolve(mapJobDocumentToJobObject(scheduledJob));
    };
    if (job.schedule.type === "once") {
      agenda.schedule(job.schedule.when, job.channel.type, job, scheduled);
    } else {
      agenda.every(job.schedule.interval, job.channel.type, job, scheduled);
    }
  });
};

const deleteJob = (agenda, id) => {
  return new Promise((resolve, reject) => {
    agenda.jobs({_id: id}, (err, jobs) => {
      if (err) {
        reject(err);
        return;
      }
      if (!_.size(jobs)) {
        resolve();
        return;
      }
      jobs[0].attrs.data.deleted = true;
      jobs[0].disable();
      jobs[0].save((saveError) => {
        if (saveError) {
          reject(saveError);
          return;
        }
        resolve(mapJobDocumentToJobObject(jobs[0]));
      });
    });
  });
};

module.exports = {
  listJobs,
  getJobById,
  createJob,
  deleteJob
};
