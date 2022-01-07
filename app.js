'use strict'

const path = require('path')
const AutoLoad = require('fastify-autoload')

module.exports = async function (fastify, opts) {
  // Place here your custom code!

  fastify.register(require('fastify-mongodb'), {
    // force to close the mongodb connection when app stopped
    // the default value is false
    forceClose: true,

    url: 'mongodb+srv://mongo:mongo@cluster0.wjlcx.mongodb.net/htmx?retryWrites=true&w=majority'
  })

  fastify.register(require('fastify-formbody'))

  fastify.register(require('fastify-bcrypt'), {
    saltWorkFactor: 12
  })

  fastify.register(require('fastify-static'), {
    // vite build
    root: path.join(__dirname, 'html/dist')
  })

  fastify.register(require('point-of-view'), {
    engine: {
      pug: require('pug')
    },
    root: './views'
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
