module.exports = {
  name: '__MSG_extName__',
  version: '0.2.0',
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
    'webRequest',
    'webRequestBlocking',
    'contextMenus',
    '*://*.messenger.com/*'
  ],
  background: {
    persistent: true,
    page: 'pages/background.html'
  },
  options_page: 'pages/options.html',
  content_scripts: [{
    js: [
      'js/manifest.js',
      'js/vendor.js',
      'js/content.js'
    ],
    matches: ['*://*.messenger.com/*'],
    run_at: 'document_end'
  }],
  default_locale: 'en',
  content_security_policy: "script-src 'self' 'unsafe-eval' https://www.google-analytics.com https://www.messenger.com https://www.google.com https://checkout.google.com; object-src 'self'",
  // For release:
  // key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApgt7WcuhA9s1XINhU8hU5b3ZCL7u6KAZSGJLXHjczbxI4RD8bMFUKeGuRoogHjdb1hcMWXqYdYcdgfoecFdUX3mbdgueybBXSdVnU/b2/6qu6iMK3VplMf/6gYmtEudJtq2QnqRivmS2NWH6RdvpwR8mKSPlgLZmV80t+dnR91Bozih55f0J/3PhbWk8OFpYXWFrUbTJmfiy9LpQARiILJ88GXjCBa53aokWvd14+YBWHNx8HyzQDamJBEM3XaY7vY5xa1OJGg1DxKYAupRHXyn9qnjPMv94a934JGc0witZ3aVRJFiS8l7MAJwCIjCCtxhezT4CHKDmOslaJi2hVQIDAQAB'
  // For beta:
  key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnp3e8PxMX/dmup0Qx/Fr0oPswJMVKpbxI3QRcDMVG/wbENGYcDStRUIaebkmzc2OYfBIEFRcYmxwdLxTzs8qf4FurbJJCcwfIlCwauVxu+JwRaL1hO98RWVQgZFILbUw/4iS+KZ5GzG8Cn5Jjpt1Y2iQ+MBtcHK0GOqd8eb6FwM1foFDY8Q7JUKfGJbur7vfr7iNxhaZIs4+ZO9X/KlU49sur/4DG+MUamv/GfKOv9rgHrvnGDBaEJBXuIMhCcy8RsYABtTghwDf4s9qoISkJgZz211uWNbW63+aXHC9wyDhsscOoVZ1/lOvTYQTZcxjGhhmo2EwWUNxRI8frSPpFwIDAQAB'
}
