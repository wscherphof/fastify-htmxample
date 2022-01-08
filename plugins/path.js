'use strict'

const fp = require('fastify-plugin')

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

module.exports = fp(async function (fastify, opts) {
  fastify.decorateRequest('pathUrl', function (path) {
    let base = '/index.html'
    const referer = this.headers.referer
    if (referer) {
      const { origin, pathname } = new URL(referer)
      base = `${origin}${pathname}`
    }
    return `${base}?path=${encodeURIComponent(path)}`
  })
})
