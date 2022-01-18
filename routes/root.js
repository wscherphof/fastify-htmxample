'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/', async function app (request, reply) {
    return reply.view('app')
  })

  fastify.auth.get('/secret', async function (request, reply) {
    return reply.view('secret')
  })
}
