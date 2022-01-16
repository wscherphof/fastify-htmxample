'use strict'
const URL = require('url').URL

module.exports = async function (fastify, opts) {
  fastify.auth.optional.get('/app', async function (request, reply, auth) {
    const { protocol, hostname, query } = request
    const user = await auth()
    const url = new URL(decodeURIComponent(query.url || '/'), `${protocol}://${hostname}`)
    return reply.view('app', { user, url })
  })

  fastify.auth.get('/secret', async function (request, reply) {
    return reply.view('secret')
  })
}
