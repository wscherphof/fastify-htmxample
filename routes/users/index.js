'use strict'

const URL = require('url').URL

module.exports = async function (fastify, opts) {
  fastify.get('/signup', async function (request, reply) {
    return reply.view('users/signup')
  })

  const rateLimit = {
    config: {
      rateLimit: {
        max: 1,
        timeWindow: '5 minutes'
      }
    }
  }

  fastify.post('/', rateLimit, async function (request, reply) {
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
    return mailPassword(request, email)
  })

  async function mailPassword(request, email) {
    const token = await fastify.crypto.encrypt({
      email,
      time: new Date()
    })
    const currentUrl = new URL(request.headers['hx-current-url'])
    const url = `${currentUrl.origin}/users/password?token=${token}`
    const mail = {
      to: email,
      subject: 'Instructions for creating your new password',
      text: `Follow this link to create your new password: ${url}`
    }
    try {
      const { envelope } = await fastify.mailer.sendMail(mail)
      return `Please follow the link in the email that ${envelope.from} sent to ${envelope.to[0]}`
    } catch (error) {
      // throw error
      console.log(error)
      return `
        Probably the server's email credentials aren't configured yet.
        See the README.md for how to do that.
        To give you a break, we'll now do something that in Production would
        really be out of the question: we'll show you the verification link
        that should have been emailed. <br /> <br />
        Follow this link to create your new password:
        <a href="${url}">${url}</a>
      `
    }
  }

  fastify.get('/password/change', async function (request, reply) {
    return reply.view('users/password/change')
  })

  fastify.post('/password/change', rateLimit, async function (request, reply) {
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
      const { email } = await fastify.crypto.decrypt(token)
      return reply.view('users/password/index', { email, token })
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
      const { email, time } = await fastify.crypto.decrypt(token)
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
    return signIn(request, reply, { email })
  })

  async function signIn(request, reply, data) {
    await reply.signIn(data, {
      secure: !request.hostname.startsWith('localhost')
    })
    reply.hxRedirect('/')
  }

  fastify.post('/signout', async function (request, reply) {
    reply.signOut()
    reply.hxRedirect('/')
  })

  fastify.get('/signin', async function (request, reply) {
    return reply.view('users/signin')
  })

  fastify.post('/signin', async function (request, reply) {
    const { email, password } = request.body
    const users = fastify.mongo.db.collection('users')
    try {
      const user = await users.findOne({ email })
      const { salt, derivedKey } = user.password
      const hash = {
        salt: salt.buffer,
        derivedKey: derivedKey.buffer
      }
      if (user && await fastify.crypto.verify(hash, password)) {
        return signIn(request, reply, { email })
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
