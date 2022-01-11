'use strict'

module.exports = async function (fastify, opts) {
  fastify.authorised.optional.get('/app', async function (request, reply, authorization) {
    const user = await authorization()
    return reply.view('app', { user })
  })

  fastify.authorised.get('/secret', async function (request, reply) {
    return reply.view('secret')
  })
}
