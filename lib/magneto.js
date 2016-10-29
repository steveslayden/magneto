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
  winston.loggers.add("magneto", config.get("magneto.winston"));

  // create an instance of Agenda
  const agenda = new Agenda(config.get("magneto.agenda"));

  // define jobs
  defineJobs.forEach((defineJob) => {
    defineJob(agenda);
  });

  // todo: what if somone call create multiple times? mayb tests?
  agenda.on("ready", () => {
    agenda.start();
  });

  const root = options.root || DEFAULT_OPTIONS.root;

  const server = new Hapi.Server();
  server.connection(_.get(options, "server.connection", DEFAULT_OPTIONS.server.connection));

  routeModules.forEach((routeModule) => {
    // todo: check that getRoutes is a function. also try/catch so if one fails we can continue
    // do we want to?
    const routes = routeModule.createRoutes ? routeModule.createRoutes(agenda) : [];
    routes.forEach((route) => {
      route.path = `${root}${route.path}`;
      server.route(route);
    });
  });

  return {
    server
  };
};

module.exports = create;

