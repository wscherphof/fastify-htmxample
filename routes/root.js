'use strict'

module.exports = async function (fastify, opts) {
  fastify.authorized.get('/app', { authorizationOptional: true }, async function (request, reply, authorization) {
    const user = await authorization()
    return reply.view('app', { user })
  })
}
