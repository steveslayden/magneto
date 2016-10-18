"use strict";

const createRoutes = () => {
  return [{
    method: "GET",
    path: "",
    handler: (/*request, reply*/) => {
      // todo
      throw new Error("not implemented");
    }
  }, {
    method: "GET",
    path: "/{id}",
    handler: (/*request, reply*/) => {
      // todo
      throw new Error("not implemented");
    }
  }, {
    method: "POST",
    path: "",
    handler: (/*request, reply*/) => {
      // todo
      throw new Error("not implemented");
    }
  }, {
    method: "PUT",
    path: "/{id}",
    handler: (/*request, reply*/) => {
      // todo
      throw new Error("not implemented");
    }
  }, {
    method: "PATCH",
    path: "/{id}",
    handler: (/*request, reply*/) => {
      // todo
      throw new Error("not implemented");
    }
  }, {
    method: "DEL",
    path: "/{id}",
    handler: (/*request, reply*/) => {
      // todo
      throw new Error("not implemented");
    }
  }];
};

module.exports.createRoutes = createRoutes;
