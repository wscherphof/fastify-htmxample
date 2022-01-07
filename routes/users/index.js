'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/register', async function (request, reply) {
    return reply.view('users/register')
  })

  fastify.post('/', async function (request, reply) {
    const { email, password, password2 } = request.body
    if (password !== password2) {
      throw fastify.httpErrors.badRequest("passwords don't match")
    }
    const hash = await fastify.bcrypt.hash('password')
    const users = this.mongo.db.collection('users')
    try {
      await users.insertOne({ email, password: hash })
      return 'ok'
    } catch (error) {
      if (error.code === 11000) {
        throw fastify.httpErrors.badRequest('email already taken')
      } else {
        throw error
      }
    }
  })
}
