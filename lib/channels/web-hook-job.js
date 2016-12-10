"use strict";

const logger = require("winston");

const createJob = (magneto) => {
  // todo: implement :)
  magneto.define("webhook", (job, done) => {
    logger.info(`${(new Date())}: job "${job.attrs.name}": ${JSON.stringify(job.attrs.data)}`);
    done();
  });
};

module.exports = createJob;
