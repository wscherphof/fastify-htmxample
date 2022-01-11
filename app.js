'use strict'

const path = require('path')
const AutoLoad = require('fastify-autoload')
const fs = require('fs')

module.exports = async function (fastify, opts) {
  // Place here your custom code!

  fastify.register(require('fastify-formbody'))

  fastify.register(require('fastify-cookie'))

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

  fastify.register(require('fastify-mongodb'), {
    // force to close the mongodb connection when app stopped
    // the default value is false
    forceClose: true,

    url: 'mongodb+srv://mongo:mongo@cluster0.wjlcx.mongodb.net/htmx?retryWrites=true&w=majority'
  })

  fastify.register(require('fastify-mailer'), {
    defaults: { from: 'Wouter Scherphof <wouter.scherphof@outlook.com>' },
    transport: {
      host: 'smtp.office365.com',
      port: 587,
      auth: {
        user: 'wouter.scherphof@outlook.com',
        pass: process.env.OUTLOOK_PASSWORD
      },
      tls: {
        ciphers: 'SSLv3'
      }
    }
  })

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts)
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({}, opts)
  })
}
