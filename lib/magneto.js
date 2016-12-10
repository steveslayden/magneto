"use strict";

const _ = require("lodash");
const assert = require("assert");
const winston = require("winston");
const Agenda = require("agenda");
const Hapi = require("hapi");
const healthcheckRoutes = require("./routes/healthcheck-routes");
const jobRoutes = require("./routes/job-routes");
const webHookJob = require("./channels/web-hook-job.js");

const routeModules = [
  healthcheckRoutes,
  jobRoutes
];

const defineJobs = [
  webHookJob
];

// configure winston logger
const createLogger = (options) => {
  assert(options, "options.winston no provided");
  const logger = winston.loggers.get("magneto");
  winston.loggers.add("magneto", options);
  return logger;
};

// create an instance of Agenda
const createAgenda = (options) => {

  assert(options, "options required");
  assert(_.keys(options).length, "options required");

  const agenda = new Agenda(options);

  // define each type of job
  defineJobs.forEach((defineJob) => {
    defineJob(agenda);
  });

  // start agenda when it's ready
  return new Promise((resolve) => {
    agenda.on("ready", () => {
      agenda.start();
      resolve(agenda);
    });
  });
};

// crate the hapi server
const createServer = (options, agenda, logger) => {

  const server = new Hapi.Server();

  assert(_.has(options, "server.connection"), "options.server.connection not provided");
  server.connection(options.server.connection);

  assert(options.root, "options.root not provided");
  const root = options.root;

  routeModules.forEach((routeModule) => {
    const routes = routeModule.createRoutes ? routeModule.createRoutes(agenda) : [];
    routes.forEach((route) => {
      route.path = `${root}${route.path}`;
      const routeResult = _.attempt((routeVal) => server.route(routeVal), route);
      if (_.isError(routeResult)) {
        logger.error(routeResult);
      }
    });
  });

  return server;
};

// stop everything
const stop = (server, agenda) => {
  return new Promise((resolve) => {
    let error;
    server.stop()
      .catch((err) => {
        error = err;
      })
      .then(() => {
        if (agenda) {
          // agenda.stop does not produce an error
          agenda.stop(() => {
            resolve(error);
          });
        } else {
          resolve(error);
        }
      });
  });
};

const create = (options) => {

  assert(options, "options not provided");

  const logger = createLogger(options.winston);

  return createAgenda(options.agenda)
    .then((agenda) => {
      const server = createServer(options, agenda, logger);

      return {
        server,
        logger,
        start: () => server.start(),
        stop: () => stop(server, agenda)
      };
    });
};

module.exports = create;
