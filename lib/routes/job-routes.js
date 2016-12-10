"use strict";

const _ = require("lodash");
const logger = require("winston").loggers.get("magneto");
const BlueBird = require("bluebird");
const ObjectID = require("mongodb").ObjectID;
const httpStatusCodes = require("http-status-codes");

// todo: channel does not need to be the job name
// todo: job list should page and take filter

const basePath = "/jobs";

const createRoutes = (agenda) => {
  return [{
    method: "GET",
    path: `${basePath}`,
    handler: (request, reply) => {
      BlueBird.promisify(agenda.jobs, {context: agenda})({$or: [
            {"data.deleted": false},
            {"data.deleted": {$exists: false}}]})
        .then((jobs) => {
          jobs = jobs.map(mapJobDocumentToJobObject);
          reply(jobs);
        })
        .catch((err) => {
          // sms todo: throw error that returns 500
          logger.error(err.stack);
          reply().code(httpStatusCodes.INTERNAL_SERVICE_ERROR);
        });
    }
  }, {
    method: "GET",
    path: `${basePath}/{id}`,
    handler: (request, reply) => {
        // sms todo: promisfy
        // use joi validation to convert id to ObjectID
        const id = new ObjectID(request.params.id);
        agenda.jobs({_id: id, $or: [
              {"data.deleted": false},
              {"data.deleted": {$exists: false}}]},
          (err, jobs) => {
            if(err) {
                logger.error(err.stack);
                reply().code(httpStatusCodes.INTERNAL_SERVICE_ERROR);
                return;
            }
            if(!_.size(jobs)) {
              reply().code(httpStatusCodes.NOT_FOUND);
              return;
            }
            const job = mapJobDocumentToJobObject(jobs[0]);
            reply(job);
        });
    }
  }, {
    method: "POST",
    path: `${basePath}`,
    handler: (request, reply) => {
      const scheduled = (err, job) => {
        if(err) {
          logger.error(err);
          reply().code(httpStatusCodes.INTERNAL_SERVICE_ERROR);
          return;
        }
        job = mapJobDocumentToJobObject(job);
        reply(job).code(httpStatusCodes.CREATED);
      };
      if (request.payload.schedule.type === "once") {
        agenda.schedule(request.payload.schedule.when, request.payload.job.type, request.payload, scheduled);
      } else {
        agenda.every(request.payload.schedule.interval, request.payload.job.type, request.payload, scheduled);
      }
    }
  }, {
    method: "PUT",
    path: `${basePath}/{id}`,
    handler: (/*request, reply*/) => {
      // todo
      throw new Error("not implemented");
    }
  }, {
    method: "PATCH",
    path: `${basePath}/{id}`,
    handler: (/*request, reply*/) => {
      // todo
      throw new Error("not implemented");
    }
  }, {
    method: "DELETE",
    path: `${basePath}/{id}`,
    handler: (request, reply) => {
      const id = new ObjectID(request.params.id);
      agenda.jobs({_id: id}, (err, jobs) => {
        if(err) {
            logger.error(err.stack);
            reply().code(httpStatusCodes.INTERNAL_SERVICE_ERROR);
            return;
        }
        if(!_.size(jobs)) {
          reply().code(httpStatusCodes.NOT_FOUND);
          return;
        }
        jobs[0].attrs.data.deleted = true;
        jobs[0].disable();
        jobs[0].save((err) => {
          if(err) {
              logger.error(err.stack);
              reply().code(httpStatusCodes.INTERNAL_SERVICE_ERROR);
              return;
          }
          reply().code(httpStatusCodes.NO_CONTENT);
        });
      });
    }
  }];
};

const mapJobDocumentToJobObject = (jobDoc) => {
  return _.merge({id: jobDoc.attrs._id}, jobDoc.attrs.data);
};

module.exports.createRoutes = createRoutes;
