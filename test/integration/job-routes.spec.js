"use strict";

const _ = require("lodash");
const config = require("config");
const axios = require("axios");
const dateFnsParse = require("date-fns/parse");
const magnetoFactory = require("../..");
const assert = require("assert");
const httpStatusCodes = require("http-status-codes");

// todo: hard delete jobs when done
// todo: test that job list does not return deleted jobs

const JOB_API_URL = "http://localhost:3000/api/jobs";

const createOnceJob = () => {
  return {
    schedule: {
      type: "once",
      when: new Date()
    },
    job: {
      type: "webhook",
      method: "POST",
      url: "http://localhost:3000/",
      payload: "test"
    }
  };
};

describe("job-routes", () => {

  let magneto;

  beforeEach(() => {
    return magnetoFactory(config.get("magneto"))
      .then((results) => {
        magneto = results;
        return magneto.start();
      });
  });

  afterEach(() => {
    return magneto.stop();
  });

  it("should create job", () => {
    const job = createOnceJob();

    return axios.post(JOB_API_URL, job)
      .then((response) => {
        assert.equal(httpStatusCodes.CREATED, response.status);
        assert(response.data.id);
        const expected = _.merge({ id: response.data.id }, job);
        expected.schedule.when = expected.schedule.when.toISOString();
        assert(_.isEqual(expected, response.data));
      });
  });

  it("should get a job", () => {
    const job = createOnceJob();

    return axios.post(JOB_API_URL, job)
      .then((response) => {
        assert.equal(httpStatusCodes.CREATED, response.status);
        assert(response.data.id);
        return axios.get(`${JOB_API_URL}/${response.data.id}`);
      })
      .then((response) => {
        assert.equal(httpStatusCodes.OK, response.status);
        const expected = _.merge({ id: response.data.id }, job);
        expected.schedule.when = expected.schedule.when.toISOString();
        assert(_.isEqual(expected, response.data));
      });
  });

  it("should list jobs", () => {
    const JOB_COUNT = 3;
    const jobs = _.times(JOB_COUNT, createOnceJob);
    let jobIds;

    return Promise.all(
      jobs.map((job) => axios.post(JOB_API_URL, job))
    )
    .then((responses) => {
      jobIds = responses.map((response) => response.data.id);
      return axios.get(JOB_API_URL);
    })
    .then((response) => {
      assert.equal(httpStatusCodes.OK, response.status);
      assert(response.data.length >= JOB_COUNT);
      jobIds.forEach((jobId) => {
        assert(response.data.find((j) => j.id == jobId));
      });
    });
  });

  it("should delete a job", () => {
    const job = createOnceJob();
    let jobId;

    return axios.post(JOB_API_URL, job)
      .then((response) => {
        assert.equal(httpStatusCodes.CREATED, response.status);
        assert(response.data.id);
        jobId = response.data.id;
        return axios.get(`${JOB_API_URL}/${jobId}`);
      })
      .then((response) => {
        assert.equal(httpStatusCodes.OK, response.status);
        return axios.delete(`${JOB_API_URL}/${jobId}`);
      })
      .then((response) => {
        assert.equal(httpStatusCodes.NO_CONTENT, response.status);
        return axios.get(`${JOB_API_URL}/${jobId}`, {
          validateStatus: (status) => { return status >= 200 && status < 500; }
        });
      })
      .then((response) => {
        assert.equal(httpStatusCodes.NOT_FOUND, response.status);
      });
  });
});
