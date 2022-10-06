'use strict'

const https = require('https')
const {STATUS_CODES} = require('http')
const SetupChain = require('../../index.js')

const FRUIT_URL = 'https://www.fruityvice.com/api/fruit'

const chain = new SetupChain(null, {
  fruit: async function fruit(name) {
    const content = await get(`${FRUIT_URL}/${name}`)
    return content
  }
})

{
  chain
    .fruit('apple')
    .execute()
    .then(({fruit}) => {
      console.log(
        `${fruit.name} (${fruit.family} ${fruit.genus})`
      )
    })
    .catch((err) => {
      const [action,, input] = err.chain_params
      console.error(`unable to complete ${action}(${input})`)
    })
}

// request function
function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, {
        rejectUnauthorized: false
      , requestCert: true
      }, (res) => {
        if (res.statusCode !== 200) {
          return reject(new Error(STATUS_CODES[res.statusCode]))
        }
        let content = ''
        res.on('data', (chunk) => {
          content += chunk.toString('utf8')
        })

        res.on('end', () => {
          resolve(JSON.parse(content))
        })
        res.once('error', reject)
      })
      .once('error', reject)
  })
}
