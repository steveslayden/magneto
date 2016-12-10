"use strict";

const createRoutes = () => {
  return [{
    method: "GET",
    path: "/healthcheck",
    handler: (request, reply) => {
      // todo: something more sophisticated
      // todo: version, pid
      reply({status: "OK"});
    }
  }];
};

module.exports.createRoutes = createRoutes;
