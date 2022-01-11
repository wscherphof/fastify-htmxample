'use strict'

const fp = require('fastify-plugin')
const path = require('path')
const fs = require('fs')

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

async function plugin(fastify, opts) {

  // serve the vite dist as the root
  fastify.register(require('fastify-static'), {
    root: path.join(__dirname, 'vite/dist')
  })

  // in some cases, make sure to serve the full page HTML
  fastify.addHook('onRequest', (request, reply, done) => {
    const { url, headers, protocol, hostname } = request
    const referer = headers.referer || ''
    const externalReferer = !referer.startsWith(`${protocol}://${hostname}`)
    const hxHistoryRestoreRequest = headers['hx-history-restore-request']
    const isFileName = url.match(/\.\w+$/)
    if (!isFileName && (externalReferer || hxHistoryRestoreRequest)) {
      const indexHtml = path.resolve(process.cwd(), 'vite', 'dist', 'index.html')
      reply.header('Content-Type', 'text/html')
      reply.send(fs.createReadStream(indexHtml, 'utf8'))
    }
    done()
  })

  fastify.register(require('point-of-view'), {
    engine: {
      pug: require('pug')
    },
    root: './views'
  })

  fastify.decorateReply('hxRedirect', function hxRedirect(path) {
    this.header('HX-Redirect', path)
    return 'redirect'
  })

}

module.exports = fp(plugin, { name: 'fastify-htmx' })
