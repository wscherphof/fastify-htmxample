'use strict'

const fp = require('fastify-plugin')

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

const crypto = require('crypto')
const { promisify } = require('util')
const scrypt = promisify(crypto.scrypt)
const randomBytes = promisify(crypto.randomBytes)
const { timingSafeEqual } = crypto
const LEN = 32

// nicked from https://github.com/patrickpissurno/fastify-esso
/**
 * Turns cleartext into ciphertext
 * @param { Buffer } key
 * @param { string } data
 * @returns { Promise<string> }
 */
async function encrypt (key, data) {
  data = JSON.stringify(data)
  const iv = await randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  return new Promise((resolve, reject) => {
    let encrypted = ''
    cipher.on('readable', () => {
      let chunk
      while ((chunk = cipher.read()) !== null) {
        encrypted += chunk.toString('hex')
      }
    })
    cipher.on('end', () => {
      resolve([iv.toString('hex'), encrypted].join(':'))
    })
    cipher.on('error', reject)

    cipher.write(data)
    cipher.end()
  })
}

// nicked from https://github.com/patrickpissurno/fastify-esso
/**
* Turns ciphertext into cleartext
* @param { Buffer } key
* @param { string } data
* @returns { Promise<string> }
*/
async function decrypt (key, data) {
  const [iv, encrypted] = data.split(':')
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    key,
    Buffer.from(iv, 'hex')
  )
  return new Promise((resolve, reject) => {
    let chunk
    let decrypted = ''
    decipher.on('readable', () => {
      while ((chunk = decipher.read()) !== null) {
        decrypted += chunk.toString('utf8')
      }
    })
    decipher.on('end', () => resolve(
      JSON.parse(decrypted)
    ))
    decipher.on('error', reject)

    decipher.write(encrypted, 'hex')
    decipher.end()
  })
}

async function plugin (fastify, opts) {
  async function random () {
    return randomBytes(LEN)
  }
  async function key () {
    const collection = await fastify.mongo.db.collection('conf')
    const conf = await collection.findOne()
    if (conf) {
      return conf.key.buffer
    } else {
      const key = await scrypt(await random(), await random(), LEN)
      await collection.insertOne({ key })
      return key
    }
  }
  fastify.decorate('crypto', {
    hash: async (password) => {
      const salt = await random()
      const derivedKey = await scrypt(password, salt, LEN)
      return { salt, derivedKey } // 2 x Buffer
    },
    verify: async (hash, password) => {
      const { salt, derivedKey } = hash // 2 x MonetDB Binary
      return timingSafeEqual(
        await scrypt(password, salt.buffer, LEN),
        derivedKey.buffer
      )
    },
    encrypt: async (data) => {
      return encrypt(await key(), data)
    },
    decrypt: async (data) => {
      return decrypt(await key(), data)
    }
  })
}

module.exports = fp(plugin, { name: 'fastify-crypto' })
