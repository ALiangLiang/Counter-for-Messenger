const config = require('../core/.env')

const manifest = {
  name: '__MSG_extName__',
  version: '0.2.2.1',
  description: '__MSG_extDescription__',
  author: 'ALiangLiang',
  manifest_version: 2,
  icons: {
    '16': 'icons/16.png',
    '19': 'icons/19.png',
    '38': 'icons/38.png',
    '64': 'icons/64.png',
    '128': 'icons/128.png'
  },
  browser_action: {
    default_icon: { '16': 'icons/16.png' },
    default_title: '__MSG_extName__'
  },
  permissions: [
    'tabs',
    'downloads',
    'webRequest',
    'webRequestBlocking',
    '*://*.facebook.com/*'
  ],
  background: {
    persistent: true,
    page: 'pages/background.html'
  },
  content_scripts: [{
    js: [
      'js/manifest.js',
      'js/vendor.js',
      'js/content.js'
    ],
    matches: ['*://*.facebook.com/*'],
    run_at: 'document_end'
  }],
  default_locale: 'en',
  content_security_policy: "script-src 'self' 'unsafe-eval' https://www.google-analytics.com https://www.google.com https://checkout.google.com; object-src 'self'"
}

const optionPage = 'pages/options.html'
if (!process.env.FIREFOX) {
  console.info('chrome')
  Object.assign(manifest, {
    options_page: optionPage,
    key: config[(!process.env.BETA) ? 'release' : 'beta'].key
  })
} else {
  console.info('firefox')
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
