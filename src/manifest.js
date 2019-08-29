const config = require('../core/.env')

const manifest = {
  name: '__MSG_extName__',
  version: '0.2.6',
  version_name: (process.env.CHROME) ? '0.2.6' : undefined,
  description: '__MSG_extDescription__',
  author: 'ALiangLiang',
  manifest_version: 2,
  icons: {
    16: 'icons/16.png',
    19: 'icons/19.png',
    38: 'icons/38.png',
    64: 'icons/64.png',
    128: 'icons/128.png'
  },
  browser_action: {
    default_icon: { 16: 'icons/16.png' },
    default_title: '__MSG_extName__'
  },
  permissions: [
    'tabs',
    'identity',
    'downloads',
    'webRequest',
    'webRequestBlocking',
    '*://*.facebook.com/*',
    'https://www.googleapis.com/',
    'https://www-googleapis-staging.sandbox.google.com/'
  ],
  background: {
    persistent: true,
    page: 'pages/background.html'
  },
  content_scripts: [{
    js: [
      'js/content.js'
    ],
    matches: ['*://*.facebook.com/'],
    run_at: 'document_end'
  }],
  default_locale: 'en',
  content_security_policy: `script-src 'self' ${(process.env.NODE_ENV === 'development') ? '\'unsafe-eval\'' : ''} https://connect.facebook.net https://www.google-analytics.com https://www.google.com https://checkout.google.com; object-src 'self'`
}

const optionPage = 'pages/options.html'
const stage = (process.env.ALPHA) ? 'alpha' : ((process.env.BETA) ? 'beta' : ((process.env.DEV) ? 'dev' : 'release'))
console.info('Stage:', stage)
const browser = (process.env.FIREFOX) ? 'Firefox' : 'Chrome'
console.info('Browser:', browser)
if (!process.env.FIREFOX) {
  Object.assign(manifest, {
    options_page: optionPage,
    oauth2: {
      client_id: config[stage].clientId,
      scopes: [
        'https://www.googleapis.com/auth/plus.login',
        'https://www.googleapis.com/auth/chromewebstore',
        'https://www.googleapis.com/auth/chromewebstore.readonly'
      ]
    },
    key: config[stage].key
  })
} else {
  delete manifest.background.persistent // Firefox not support background.persistent
  Object.assign(manifest, {
    applications: {
      gecko: {
        id: 'counter-for-messenger@aliangliang.top',
        strict_min_version: '56.0'
      }
    },
    options_ui: {
      page: optionPage
    }
  })
}

module.exports = manifest
