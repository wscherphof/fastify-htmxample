'use strict'

const fp = require('fastify-plugin')

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

async function plugin(fastify, opts) {

  function authorised(method) {
    return function (path, options, handler) {
      if (typeof options === 'function') {
        handler = options
        options = {}
      }
      const userMandatory = !(options.authorizationOptional === true)
      delete options.authorizationOptional
      fastify[method](path, options, async function userHandler(request, reply) {
        async function authorization() {
          const authorization = request.cookies['Authorization']
          try {
            return await fastify.crypto.decrypt(authorization)
          } catch (error) {
            return null
          }
        }
        if (userMandatory) {
          try {
            const { email } = await authorization()
          } catch (error) {
            return unauthorized()
          }
        }
        return handler(request, reply, authorization)
        function unauthorized() {
          throw fastify.httpErrors.unauthorized('please login')
        }
      })
    }
  }

  fastify.decorate('authorised', {
    get: authorised('get'),
    push: authorised('push'),
    post: authorised('post'),
    delete: authorised('delete'),
    patch: authorised('patch')
  })

  fastify.decorateReply('signIn', async function signIn(data, options = {}) {
    const defaults = {
      path: '/',
      maxAge: 60 * 60 * 24, // seconds
      httpOnly: true,
      secure: true
    }
    options = Object.assign(defaults, options)
    const encrypted = await fastify.crypto.encrypt(data)
    this.setCookie('Authorization', encrypted, options)
  })

  fastify.decorateReply('signOut', function signOut() {
    this.clearCookie('Authorization')
  })
}

module.exports = fp(plugin, {
  name: 'fastify-authorised',
  dependencies: [
    'fastify-crypto',
    'fastify-cookie',
    'fastify-sensible'
  ]
})
