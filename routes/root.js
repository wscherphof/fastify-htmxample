'use strict'
const URL = require('url').URL

module.exports = async function (fastify, opts) {
  fastify.auth.optional.get('/app', async function (request, reply, auth) {
    const user = await auth()
    return reply.view('app', { user })
  })

  fastify.auth.get('/secret', async function (request, reply) {
    return reply.view('secret')
  })
}
