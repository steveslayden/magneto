"use strict";

const createRoutes = () => {
  return [{
    method: "GET",
    path: "/healthcheck",
    handler: (request, reply) => {
      // todo: something more sophisticated
      reply({status: "OK"});
    }
  }];
};

module.exports.createRoutes = createRoutes;
