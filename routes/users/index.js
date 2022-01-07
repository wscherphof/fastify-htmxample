'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/register', async function (request, reply) {
    return reply.view('users/register')
  })

  fastify.post('/', async function (request, reply) {
    return request.body
  })
}
