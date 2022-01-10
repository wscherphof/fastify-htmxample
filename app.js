'use strict'

const path = require('path')
const AutoLoad = require('fastify-autoload')
const fs = require('fs')

module.exports = async function (fastify, opts) {
  // Place here your custom code!

  fastify.register(require('fastify-formbody'))

  fastify.register(require('fastify-cookie'))

  fastify.register(require('fastify-static'), {
    // vite build
    root: path.join(__dirname, 'html/dist')
  })

  fastify.addHook('onRequest', (request, reply, done) => {
    const file = request.url.match(/\.\w+$/)
    const fromMe = request.headers['referer'] && request.headers['referer']
      .startsWith(`${request.protocol}://${request.hostname}`)
    if (!file && (!fromMe || request.headers['history-restore-request'])) {
      const index = path.resolve(process.cwd(), 'html', 'dist', 'index.html')
      const stream = fs.createReadStream(index, 'utf8')
      reply.header('Content-Type', 'text/html')
      reply.send(stream)
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
