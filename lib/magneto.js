"use strict";

const _ = require("lodash");
const config = require("config");
const winston = require("winston");
const Agenda = require("agenda");
const Hapi = require("hapi");
const healthcheckRoutes = require("./routes/healthcheck-routes");
const jobRoutes = require("./routes/job-routes");
const webHookJob = require("./jobs/web-hook-job.js");

const routeModules = [
  healthcheckRoutes,
  jobRoutes
];

const defineJobs = [
  webHookJob
];

const DEFAULT_OPTIONS = {
  root: "/api",
  server: {
    connection: {
      port: 3000
    }
  }
};

const create = (options) => {

  options = options || DEFAULT_OPTIONS;

  // configure winston logger
  const logger = (function createLogger() {
    const logger = winston.loggers.get("magneto");
    winston.loggers.add("magneto", config.get("magneto.winston"));
    return logger;
  });

  // create an instance of Agenda
  const agenda = (function createAgenda() {
    const agenda = new Agenda(config.get("magneto.agenda"));

    // define jobs
    defineJobs.forEach((defineJob) => {
      defineJob(agenda);
    });

    // todo: what if somone call create multiple times? mayb tests?
    agenda.on("ready", () => {
      agenda.start();
    });

    return agenda;
  })();

  const server = (function createServer() {
    const server = new Hapi.Server();
    server.connection(_.get(options, "server.connection", DEFAULT_OPTIONS.server.connection));

    const root = options.root || DEFAULT_OPTIONS.root;

    routeModules.forEach((routeModule) => {
      // todo: check that getRoutes is a function. also try/catch so if one fails we can continue
      // do we want to?
      const routes = routeModule.createRoutes ? routeModule.createRoutes(agenda) : [];
      routes.forEach((route) => {
        route.path = `${root}${route.path}`;
        server.route(route);
      });
    });

    return server;
  })();

  const stop = () => {
    server.stop()
      .catch((err) => {
        logger.error(err);
      });
  };

  return {
    server,
    logger,
    stop
  };
};

module.exports = create;
