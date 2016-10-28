"use strict";

const logger = require("winston");

const defineJob = (agenda) => {
  // todo: implement :)
  agenda.define("webhook", (job, done) => {
    logger.info(`${(new Date())}: job "${job.attrs.name}": ${JSON.stringify(job.attrs.data)}`);
    done();
  });
};

module.exports = defineJob;

