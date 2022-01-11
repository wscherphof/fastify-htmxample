'use strict'

const fp = require('fastify-plugin')
const path = require('path')
const fs = require('fs')

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

async function plugin(fastify, options = {}) {
  const defaults = {
    dist: path.resolve(process.cwd(), 'vite', 'dist'),
    views: './views'
  }
  options = Object.assign(defaults, options)

  // serve the vite dist as the root
  fastify.register(require('fastify-static'), {
    root: options.dist
  })

  // serve the full page HTML when not Ajax
  fastify.addHook('onRequest', (request, reply, done) => {
    const { url, headers } = request
    const isFileName = url.match(/\.\w+$/) // .js, .css, ...
    const hxRequest = headers['hx-request']
    const hxHistoryRestoreRequest = headers['hx-history-restore-request']
    if (!isFileName && (!hxRequest || hxHistoryRestoreRequest)) {
      const indexHtml = path.join(options.dist, 'index.html')
      reply.header('Content-Type', 'text/html')
      reply.send(fs.createReadStream(indexHtml, 'utf8'))
    }
    done()
  })

  fastify.register(require('point-of-view'), {
    engine: { pug: require('pug') },
    root: options.views,
    options: {
      basedir: path.join(__dirname, '..') // "node_modules"
    }
  })

  fastify.decorateReply('hxRedirect', function hxRedirect(path) {
    this.header('HX-Redirect', path)
    return 'redirect'
  })

}

module.exports = fp(plugin, { name: 'fastify-htmx' })
