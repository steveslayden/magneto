"use strict";

const request = require("superagent");
const Promise = require("bluebird");
const agendaApiFactory = require("../..");
const assert = require("assert");
const logger = require("winston");
const httpStatusCodes = require("../../lib/http-status-codes");

// todo: need promise? or does start return a promise?
const createAgendaApi = () => {
  return new Promise((resolve) => {
    const agendaApi = agendaApiFactory();
    agendaApi.server.start(() => {
      resolve(agendaApi);
    });
  });
};

describe("healthcheck", () => {

  it("should return OK 200", (done) => {
    let agendaApi;
    createAgendaApi()
      .then((results) => {
        agendaApi = results;
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
        if (agendaApi) {
          agendaApi.server.stop()
            .catch((err) => { //eslint-disable-line max-nested-callbacks
              logger.error(err);
            });
        }
      });
  });
});
