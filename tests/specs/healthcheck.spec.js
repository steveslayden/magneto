"use strict";

const _ = require("lodash");
const config = require("config");
const request = require("superagent");
const magnetoFactory = require("../..");
const assert = require("assert");
const logger = require("winston");
const httpStatusCodes = require("../../lib/http-status-codes");

const createMagneto = () => {
  return magnetoFactory(config.get("magneto"))
    .then((magneto) => {
      magneto.server.start().then(() => {
        return magneto;
      });
    });
};

const stopMagneto = (magneto) => {
  if(!magneto) {
    return;
  }

  magneto.stop()
    .catch(err => logger.error(err));
};

describe("healthcheck", () => {

  it("should return OK 200", (done) => {
    let magneto;
    createMagneto()
      .then((results) => {
        magneto = results;
        return request.get("http://localhost:3000/api/healthcheck");
      })
      .then((res) => {
        assert.equal(httpStatusCodes.OK, res.statusCode);
        assert.equal("OK", res.body.status);
        done();
      })
      .catch(done)
      .then(() => {
        stopMagneto(magneto);
      });
  });
});
