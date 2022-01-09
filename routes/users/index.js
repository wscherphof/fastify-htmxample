'use strict'

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
        return badRequest('email already taken')
      } else {
        throw error
      }
    }
    return await mailPassword(request, email)
  })

  async function mailPassword(request, email) {
    const token = await fastify.crypto.encrypt(JSON.stringify({
      email,
      time: new Date()
    }))
    const url = request.pathUrl(`/users/password?token=${token}`)
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
  }

  fastify.get('/passwordchange', async function (request, reply) {
    reply.header('HX-Push', request.pathUrl('/users/passwordchange'))
    return reply.view('users/passwordchange')
  })

  fastify.post('/passwordchange', async function (request, reply) {
    const { email } = request.body
    const users = fastify.mongo.db.collection('users')
    try {
      const user = await users.findOne({ email })
      if (user) {
        return await mailPassword(request, email)
      } else {
        throw fastify.httpErrors.conflict('user not found')
      }
    } catch (error) {
      throw error
    }
  })

  fastify.get('/password', async function (request, reply) {
    const { token } = request.query
    try {
      const { email } = JSON.parse(await fastify.crypto.decrypt(token))
      reply.header('HX-Push', request.pathUrl('/users/password'))
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
      const { email, time } = JSON.parse(await fastify.crypto.decrypt(token))
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

    const hash = await fastify.crypto.hash(password)
    const users = fastify.mongo.db.collection('users')
    try {
      await users.updateOne({ email }, { $set: { password: hash } })
    } catch (error) {
      throw error
    }
    return reply.redirect('/')
  })

  fastify.get('/authenticate', async function (request, reply) {
    reply.header('HX-Push', request.pathUrl('/users/authenticate'))
    return reply.view('users/authenticate')
  })

  fastify.post('/authenticate', async function (request, reply) {
    const { email, password } = request.body
    const hash = await fastify.crypto.hash(password)
    const users = fastify.mongo.db.collection('users')
    try {
      const user = await users.findOne({ email, password: hash })
      if (user) {
        return reply.redirect('/')
      } else {
        throw fastify.httpErrors.conflict('user/password not found')
      }
    } catch (error) {
      throw error
    }
  })

  function badRequest(message) {
    throw fastify.httpErrors.badRequest(message)
  }
}
