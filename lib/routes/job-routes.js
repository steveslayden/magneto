"use strict";

const logger = require("winston").loggers.get("magneto");
const ObjectID = require("mongodb").ObjectID;
const httpStatusCodes = require("http-status-codes");
const jobManager = require("../job");

// todo: error handling
// todo: job list should page and take filter

const basePath = "/jobs";

const createRoutes = (agenda) => {
  return [{
    method: "GET",
    path: `${basePath}`,
    handler: (request, reply) => {
      jobManager.listJobs(agenda)
        .then(reply)
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
      // use joi validation to convert id to ObjectID
      const id = new ObjectID(request.params.id);
      jobManager.getJobById(agenda, id)
        .then((job) => {
          if (!job) {
            return reply().code(httpStatusCodes.NOT_FOUND);
          }
          return reply(job);
        })
        .catch((err) => {
          logger.error(err.stack);
          reply().code(httpStatusCodes.INTERNAL_SERVICE_ERROR);
        });
    }
  }, {
    method: "POST",
    path: `${basePath}`,
    handler: (request, reply) => {
      jobManager.createJob(agenda, request.payload)
        .then((job) => {
          reply(job).code(httpStatusCodes.CREATED);
        })
        .catch((err) => {
          logger.error(err.stack);
          reply().code(httpStatusCodes.INTERNAL_SERVICE_ERROR);
        });
    }
  }, {
    method: "PUT",
    path: `${basePath}/{id}`,
    handler: (/*request, reply*/) => {
      // todo: implement
      throw new Error("not implemented");
    }
  }, {
    method: "PATCH",
    path: `${basePath}/{id}`,
    handler: (/*request, reply*/) => {
      // todo: implement
      throw new Error("not implemented");
    }
  }, {
    method: "DELETE",
    path: `${basePath}/{id}`,
    handler: (request, reply) => {
      const id = new ObjectID(request.params.id);
      jobManager.deleteJob(agenda, id)
        .then((job) => {
          if (!job) {
            return reply().code(httpStatusCodes.NOT_FOUND);
          }
          return reply().code(httpStatusCodes.NO_CONTENT);
        });
    }
  }];
};

module.exports.createRoutes = createRoutes;
