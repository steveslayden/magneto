"use strict";

const request = require("superagent");
const Promise = require("bluebird");
const magnetoFactory = require("../..");
const assert = require("assert");
const logger = require("winston");
const httpStatusCodes = require("../../lib/http-status-codes");

// todo: need promise? or does start return a promise?
const createMagneto = () => {
  return new Promise((resolve) => {
    const magneto = magnetoFactory();
    magneto.server.start(() => {
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
        // todo: put this in a function
        if (magneto) {
          magneto.server.stop()
            .catch((err) => { //eslint-disable-line max-nested-callbacks
              logger.error(err);
            });
        }
      });
  });
});
