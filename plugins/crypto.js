'use strict'

const fp = require('fastify-plugin')

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

const { scrypt, randomBytes } = require('crypto')
const { promisify } = require('util')
const scryptPromise = promisify(scrypt)
const randomBytesPromise = promisify(randomBytes)
// FIXME: dependency on package internals
const { encrypt, decrypt } = require('fastify-esso/lib/utils.js')

module.exports = fp(async function (fastify, opts) {
  let _conf
  async function conf() {
    if (_conf) {
      return _conf
    }
    const collection = await fastify.mongo.db.collection('conf')
    let conf = await collection.findOne()
    if (!conf) {
      conf = {
        secret: (await randomBytesPromise(32)).toString('hex'),
        salt: (await randomBytesPromise(32)).toString('hex')
      }
      await collection.insertOne(conf)
    }
    let { secret, salt } = conf;
    secret = Buffer.from(secret, 'hex')
    salt = Buffer.from(salt, 'hex')
    const key = await scryptPromise(secret, salt, 32)
    _conf = { key, salt }
    return _conf
  }

  fastify.decorate('crypto', {
    hash: async (password) => {
      return scryptPromise(password, (await conf()).salt, 64)
    },
    encrypt: async (data) => {
      return encrypt((await conf()).key, data)
    },
    decrypt: async (data) => {
      return decrypt((await conf()).key, data)
    },
  })
})
