'use strict'

const { scrypt } = require('crypto')
const { promisify } = require('util')
const scryptPromise = promisify(scrypt)
// FIXME: dependency on package internals
const { encrypt, decrypt } = require('fastify-esso/lib/utils.js')
const key = scryptPromise('3t78cby324897b3t978ct673tb673t7890bt578b', '98474b478v346v7436v7', 32)

module.exports = async function (fastify, opts) {
  fastify.get('/register', async function (request, reply) {
    reply.header('HX-Push', request.pathUrl('/users/register'))
    return reply.view('users/register')
  })

  fastify.post('/', async function (request, reply) {
    const { email } = request.body
    const users = fastify.mongo.db.collection('users')
    try {
      await users.insertOne({ email })
    } catch (error) {
      if (error.code === 11000) {
        badRequest('email already taken')
      } else {
        throw error
      }
    }

    const token = await encrypt(await key, JSON.stringify({
      email,
      time: new Date()
    }))
    const url = request.pathUrl(`/users/activate?token=${token}`)
    const mail = {
      to: email,
      subject: 'New password',
      text: `Follow this link to create your new password: ${url}`
    }
    try {
      const { envelope } = await fastify.mailer.sendMail(mail)
      return `Please follow the link in the email that ${envelope.from} sent to ${envelope.to[0]}`
    } catch (error) {
      throw error
    }
  })

  fastify.get('/password', async function (request, reply) {
    const { token } = request.query
    try {
      const { email, time } = JSON.parse(await decrypt(await key, token))
      if (new Date() - new Date(time) > TIMEOUT) {
        return badRequest('token has expired')
      }
      return reply.view('users/password', { email, token })
    } catch (error) {
      return badRequest(error)
    }
  })

  fastify.post('/password', async function (request, reply) {
    const { token, email, password, password2 } = request.body
    if (password !== password2) {
      return badRequest("passwords don't match")
    }
    if (!password.length) {
      return badRequest('no password')
    }

    try {
      const { email, time } = JSON.parse(await decrypt(await key, token))
      if (email !== request.body.email) {
        return badRequest("token doesn't match email")
      }
      const TIMEOUT = 60 * 1000 * 15 // 15 minutes
      if (new Date() - new Date(time) > TIMEOUT) {
        return badRequest('token has expired')
      }
    } catch (error) {
      return badRequest(error)
    }

    const hash = await fastify.bcrypt.hash('password')
    const users = fastify.mongo.db.collection('users')
    try {
      await users.updateOne({ email }, { $set: { password: hash } })
    } catch (error) {
      throw error
    }
  })

  function badRequest(message) {
    throw fastify.httpErrors.badRequest(message)
  }
}
