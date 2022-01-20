"use strict";

module.exports = async function (fastify) {
  fastify.get("/", async function app(request, reply) {
    return reply.view("app");
  });

  // fastify.auth is from https://github.com/wscherphof/fastify-cookie-auth
  fastify.auth.get("/secret", async function (request, reply) {
    return reply.view("secret");
  });
};
