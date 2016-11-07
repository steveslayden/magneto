"use strict";

const _ = require("lodash");
const request = require("superagent");
const Promise = require("bluebird");
const magnetoFactory = require("../..");
const assert = require("assert");
const logger = require("winston");
const httpStatusCodes = require("../../lib/http-status-codes");

const createMagneto = () => {
  return new Promise((resolve) => {
    const magneto = magnetoFactory();
    magneto.server.start().then(() => {
      resolve(magneto);
    });
  });
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
      .finally(() => {
        _.invoke(magneto, "stop");
      });
  });
});
