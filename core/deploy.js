const fs = require('fs')
const WebStore = require('chrome-webstore-upload')
const env = require('./.env')
let config = env['release'] // Use release env by default.

let mode = 'release'
if (env.beta) { // if "beta" env exist and use beta mode.
  const isBeta = !!process.argv.find((arg) => arg === '--beta')
  mode = (isBeta) ? 'beta' : 'release'
  config = env[mode]
}

const webStoreClient = WebStore({
  extensionId: config.extensionId,
  clientId: config.clientId,
  clientSecret: config.clientSecret,
  refreshToken: config.refreshToken
})

console.log('Start fetch token.')
webStoreClient.fetchToken()
  .then(async (token) => {
    if (!config.extensionId) { // no extension id, publish first
      console.log('Start publish.')
      webStoreClient.publish('default', token)
        .then((res) => {
          webStoreClient.extensionId = res.item_id
          console.log('Your new extension id is ' + res.item_id)
          console.log('Please paste it into your .env')
        })
        .catch((err) => console.error(err))
    }

    const file = fs.createReadStream(`./${mode}-chrome.zip`)
    console.log('Start upload.')
    try {
      const res = await webStoreClient.uploadExisting(file, token)
      if (res.uploadState === 'FAILURE') return console.error('Upload failed.', res)
      console.log('Start publish.')
      await webStoreClient.publish('default', token)
    } catch (err) {
      console.error(err)
    }
  })
  .catch((err) => console.error(err))
