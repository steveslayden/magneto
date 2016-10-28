"use strict";

const config = require("config").get("magneto");
const magnetoFactory = require(".");
const logger = require("winston");

const magneto = magnetoFactory(config);

magneto.server.start(() => {
  logger.info(`Magneto started at: ${magneto.server.info.uri}`);
});

