'use strict'

module.exports = async function (fastify, opts) {
  fastify.auth.optional.get('/', async function (request, reply, auth) {
    const user = await auth
    return reply.view('app', { user, request })
  })

  fastify.auth.get('/secret', async function (request, reply) {
    return reply.view('secret')
  })
}
