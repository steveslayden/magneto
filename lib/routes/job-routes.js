"use strict";

const _ = require("lodash");
const logger = require("winston").loggers.get("magneto");
const ObjectID = require("mongodb").ObjectID;
const httpStatusCodes = require("../http-status-codes");

// channel does not need to be the job name

const basePath = "/jobs";

const createRoutes = (agenda) => {
  return [{
    method: "GET",
    path: `${basePath}`,
    handler: (request, reply) => {
        agenda.jobs({}, (err, jobs) => {
            if(err) {
                logger.error(err.stack);
                reply().code(httpStatusCodes.INTERNAL_SERVICE_ERROR);
                return;
            }
            jobs = jobs.map((job) => {
                // sms todo: determine the properties
                return {
                    channel: job.attrs.name,
                    scheduleType: "???",
                    interval: 0,
                    when: "",
                    data: job.attrs.data
                };
            });
          reply(jobs);
        });
    }
  }, {
    method: "GET",
    path: `${basePath}/{id}`,
    handler: (request, reply) => {
        // sms todo: promisfy
        // use joi validation to convert id to ObjectID
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
                // sms todo: determine the properties
            const job = {
                    channel: jobs[0].attrs.name,
                    scheduleType: "???",
                    interval: 0,
                    when: "",
                    data: jobs[0].attrs.data
                };
          reply(job);
        });
    }
  }, {
    method: "POST",
    path: `${basePath}`,
    handler: (request, reply) => {
      // sms todo: find/create standard http logging
      logger.debug(JSON.stringify(request.payload));
      const scheduled = (err, job) => {
        if(err) {
          logger.error(err);
          reply().code(httpStatusCodes.INTERNAL_SERVICE_ERROR);
          return;
        }
        // sms todo:need to reply with magneto job
        reply(job).code(httpStatusCodes.CREATED);
      };
      if (request.payload.scheduleType === "once") {
        agenda.every(request.payload.interval, "webhook", request.payload.data, scheduled);
      } else {
        agenda.schedule(request.payload.when, "webhook", request.payload.data, scheduled);
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
    method: "DEL",
    path: `${basePath}/{id}`,
    handler: (/*request, reply*/) => {
      // todo
      throw new Error("not implemented");
    }
  }];
};

module.exports.createRoutes = createRoutes;
