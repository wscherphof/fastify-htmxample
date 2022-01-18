'use strict'

module.exports = async function (fastify, opts) {
  async function app(request, reply, auth) {
    const user = await auth
    return reply.view('app', { user, request })
  }
  fastify.auth.optional.get('/', app)
  fastify.auth.optional.get('/app', app)

  fastify.auth.get('/secret', async function (request, reply) {
    return reply.view('secret', { request })
  })
}
