'use strict'

const path = require('path')
const AutoLoad = require('fastify-autoload')

module.exports = async function (fastify, opts) {
  // Place here your custom code!

  fastify.register(require('fastify-htmx'))

  fastify.register(require('pug-material-design/fastify'))

  fastify.register(require('fastify-mongodb'), {
    // force to close the mongodb connection when app stopped
    // the default value is false
    forceClose: true,

    url: 'mongodb+srv://mongo:mongo@cluster0.wjlcx.mongodb.net/htmx?retryWrites=true&w=majority'
  })

  fastify.register(require('fastify-crypto'), {
    async key () {
      const collection = await fastify.mongo.db.collection('conf')
      const conf = await collection.findOne()
      if (conf) {
        return conf.key.buffer
      } else {
        const key = await fastify.crypto.generateKey()
        await collection.insertOne({ key })
        return key
      }
    }
  })

  fastify.register(require('fastify-cookie'))

  fastify.register(require('fastify-cookie-auth'))

  fastify.register(require('fastify-mailer'), {
    defaults: { from: 'Fastify HTMX <fastify.htmx@gmail.com>' },
    transport: {
      host: 'smtp.gmail.com',
      secure: true,
      port: 465,
      auth: {
        user: 'fastify.htmx@gmail.com',
        pass: process.env.GMAIL_PASSWORD
      }
    }
  })

  fastify.register(require('fastify-formbody'))

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
