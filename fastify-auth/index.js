'use strict'

const fp = require('fastify-plugin')

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

async function plugin(fastify, opts) {

  function auth(method, enforce) {
    return function (path, options, handler) {
      if (typeof options === 'function') {
        handler = options
        options = {}
      }
      fastify[method](path, options, async function userHandler(request, reply) {
        async function authorization() {
          const authorization = request.cookies['Authorization']
          try {
            return await fastify.crypto.decrypt(authorization)
          } catch (error) {
            return null
          }
        }
        if (enforce && !(await authorization())) {
          return fastify.httpErrors.unauthorized('please login')
        } else {
          return handler(request, reply, authorization)
        }
      })
    }
  }

  fastify.decorate('auth', {
    get: auth('get', true),
    push: auth('push', true),
    post: auth('post', true),
    delete: auth('delete', true),
    patch: auth('patch', true),
    optional: {
      get: auth('get'),
      push: auth('push'),
      post: auth('post'),
      delete: auth('delete'),
      patch: auth('patch'),
    }
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
  name: 'fastify-auth',
  dependencies: [
    'fastify-crypto',
    'fastify-cookie',
    'fastify-sensible'
  ]
})
