"use strict";

const _ = require("lodash");
const Hapi = require("hapi");

const DEFAULT_OPTIONS= {
    root: "/api",
    server: {
        connection: {
            port: 3000
        }
    }
};

function create(options) {

  options = options || {};

  const root = options.root || DEFAULT_OPTIONS.root;

  const server = new Hapi.Server();
  server.connection(_.get(options, "server.connection", DEFAULT_OPTIONS.server.connection));

  server.route({
    method: "GET",
    path: `${root}/healthcheck`,
    handler: (request, reply) => {
      reply({status: "OK"});
    }
  });

  return {
      server
  };
}

module.exports = create;

