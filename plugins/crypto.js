'use strict'

const fp = require('fastify-plugin')

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

const crypto = require('crypto')
const { promisify } = require('util')
const scrypt = promisify(crypto.scrypt)
const randomBytes = promisify(crypto.randomBytes)
const { timingSafeEqual } = crypto
// FIXME: dependency on package internals
const { encrypt, decrypt } = require('fastify-esso/lib/utils.js')
const LEN = 32

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
        secret: (await randomBytes(LEN)).toString('hex'),
        salt: (await randomBytes(LEN)).toString('hex')
      }
      await collection.insertOne(conf)
    }
    let { secret, salt } = conf;
    secret = Buffer.from(secret, 'hex')
    salt = Buffer.from(salt, 'hex')
    const key = await scrypt(secret, salt, LEN)
    _conf = { key, salt }
    return _conf
  }

  fastify.decorate('crypto', {
    hash: async (password) => {
      const salt = (await conf()).salt
      const derivedKey = await scrypt(password, salt, LEN)
      return `${salt}:${derivedKey.toString('hex')}`
    },
    verify: async (hash, password) => {
      hash = hash.toString('hex')
      const [salt, key] = hash.split(':')
      const derivedKey = await scrypt(password, salt, LEN)
      return timingSafeEqual(Buffer.from(key, 'hex'), derivedKey)
    },
    encrypt: async (data) => {
      return encrypt((await conf()).key, data)
    },
    decrypt: async (data) => {
      return decrypt((await conf()).key, data)
    },
  })
})
