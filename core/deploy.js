const fs = require('fs')
const WebStore = require('chrome-webstore-upload')
const env = require('./.env')
let config = env['release'] // Use release env by default.

if (env.beta) { // if "beta" env exist and use beta mode.
  const isBeta = !!process.argv.find((arg) => arg === '--beta')
  config = env[(isBeta) ? 'beta' : 'release']
}

const webStoreClient = WebStore({
  extensionId: config.extensionId,
  clientId: config.clientId,
  clientSecret: config.clientSecret,
  refreshToken: config.refreshToken
})

webStoreClient.fetchToken()
  .then((token) => {
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

    const file = fs.createReadStream('./extension.zip')
    webStoreClient.uploadExisting(file, token)
      .then((res) => {
        console.log(res)
        if (res.uploadState === 'FAILURE') return
        return webStoreClient.publish('default', token)
      })
      .then((res) => {
        console.log(res)
      })
      .catch((err) => console.error(err))
  })
  .catch((err) => console.error(err))
