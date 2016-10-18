"use strict";

const config = require("config").get("agendaApi");
const agendaApiFactory = require(".");
const logger = require("winston");

const agendaApi = agendaApiFactory(config);

agendaApi.server.start(() => {
  logger.info(`Agenda API started at: ${agendaApi.server.info.uri}`);
});

