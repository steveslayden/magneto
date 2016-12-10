"use strict";

const config = require("config");
const request = require("superagent");
const magnetoFactory = require("../..");
const assert = require("assert");
const httpStatusCodes = require("http-status-codes");

const startMagneto = () => {
  return magnetoFactory(config.get("magneto"))
    .then((magneto) => {
      return magneto.start()
        .then(() => magneto);
    });
};

describe("healthcheck", () => {

  it("should return OK 200", (done) => {
    let magneto;
    startMagneto()
      .then((results) => {
        magneto = results;
        return request.get("http://localhost:3000/api/healthcheck");
      })
      .then((res) => {
        assert.equal(httpStatusCodes.OK, res.statusCode);
        assert.equal("OK", res.body.status);
        return magneto.stop();
      })
      .then(() => done())
      .catch(done);
  });
});
