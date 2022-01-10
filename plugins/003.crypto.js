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
async function encrypt(key, data) {
  data = JSON.stringify(data)
  const iv = await randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  return new Promise((resolve, reject) => {
    let encrypted = '';
    cipher.on('readable', () => {
      let chunk;
      while (null !== (chunk = cipher.read())) {
        encrypted += chunk.toString('hex');
      }
    });
    cipher.on('end', () => {
      // iv in hex format will always have LEN characters
      resolve(iv.toString('hex') + encrypted);
    });
    cipher.on('error', reject);

    cipher.write(data);
    cipher.end();
  });
}

// nicked from https://github.com/patrickpissurno/fastify-esso
/**
* Turns ciphertext into cleartext
* @param { Buffer } key 
* @param { string } data 
* @returns { Promise<string> }
*/
async function decrypt(key, data) {
  if (!data || data.length < LEN || data.length % 2 !== 0) // iv in hex format will always have 32 characters
    throw new Error('Invalid data');

  const iv = Buffer.from(data.substring(0, LEN), 'hex');
  const encrypted = data.substring(LEN, data.length);

  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

  return new Promise((resolve, reject) => {
    let chunk;
    let decrypted = '';
    decipher.on('readable', () => {
      while (null !== (chunk = decipher.read())) {
        decrypted += chunk.toString('utf8');
      }
    });
    decipher.on('end', () => resolve(JSON.parse(decrypted)));
    decipher.on('error', reject);

    decipher.write(encrypted, 'hex');
    decipher.end();
  });
}

async function plugin(fastify, opts) {
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
      const salt = (await conf()).salt // Buffer
      const derivedKey = await scrypt(password, salt, LEN) // Buffer
      return { salt, derivedKey }
    },
    verify: async (hash, password) => {
      const { salt, derivedKey } = hash // 2 x MonetDB Binary
      return timingSafeEqual(
        await scrypt(password, salt.buffer, LEN),
        derivedKey.buffer
      )
    },
    encrypt: async (data) => {
      return encrypt((await conf()).key, data)
    },
    decrypt: async (data) => {
      return decrypt((await conf()).key, data)
    },
  })
}

module.exports = fp(plugin, { name: 'crypto' })
