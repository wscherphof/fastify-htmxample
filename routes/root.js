'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/app', async function (request, reply) {
    return reply.view('app')
  })
}
