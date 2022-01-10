'use strict'

const fp = require('fastify-plugin')

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

async function plugin(fastify, opts) {
  function authorized(method) {
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
            const user = await fastify.crypto.decrypt(authorization)
            if (user && user.email && user.email.length) {
              return user
            } else {
              return unauthorized()
            }
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

  fastify.decorate('authorized', {
    get: authorized('get'),
    push: authorized('push'),
    post: authorized('post'),
    delete: authorized('delete'),
    patch: authorized('patch')
  })
}

module.exports = fp(plugin, { name: 'authorized', dependencies: ['crypto', 'fastify-cookie', 'fastify-sensible'] })
