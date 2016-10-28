"use strict";

const logger = require("winston");
const httpStatusCodes = require("../http-status-codes");

const createRoutes = (agenda) => {
  return [{
    method: "GET",
    path: "",
    handler: (/*request, reply*/) => {
      // todo
      throw new Error("not implemented");
    }
  }, {
    method: "GET",
    path: "/{id}",
    handler: (/*request, reply*/) => {
      // todo
      throw new Error("not implemented");
    }
  }, {
    method: "POST",
    path: "/definitions",
    handler: (request, reply) => {
      logger.info(JSON.stringify(request.payload));
      if (request.payload.scheduleType === "once") {
        agenda.every(request.payload.interval, "webhook", request.payload.data);
      } else {
        agenda.schedule(request.payload.when, "webhook", request.payload.data);
      }
      // todo: constants for status codes
      reply().code(httpStatusCodes.CREATED);
    }
  }, {
    method: "PUT",
    path: "/{id}",
    handler: (/*request, reply*/) => {
      // todo
      throw new Error("not implemented");
    }
  }, {
    method: "PATCH",
    path: "/{id}",
    handler: (/*request, reply*/) => {
      // todo
      throw new Error("not implemented");
    }
  }, {
    method: "DEL",
    path: "/{id}",
    handler: (/*request, reply*/) => {
      // todo
      throw new Error("not implemented");
    }
  }];
};

module.exports.createRoutes = createRoutes;
