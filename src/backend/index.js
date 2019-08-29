/**
 * 用來做偽造 origin header，模擬 www.facebook.com 網域環境。
 * Use to replace header "Origin". Simulate environment of "www.facebook.com".
 */
function handleRequestHeaders (details) {
  // exit on no origin found or request not send from this extension.
  if (details.initiator !== document.location.origin) return

  // Origin
  const origin = details.requestHeaders.find((header) => header.name.toUpperCase() === 'ORIGIN')
  if (origin) {
    origin.value = 'https://www.facebook.com'
  } else {
    details.requestHeaders.push({
      name: 'Origin',
      value: 'https://www.facebook.com'
    })
  }
  // Sec-Fetch-Site
  const secFetchSite = details.requestHeaders.find((header) => header.name.toUpperCase() === 'SEC-FETCH-SITE')
  if (secFetchSite) {
    secFetchSite.value = 'same-origin'
  } else {
    details.requestHeaders.push({
      name: 'Sec-Fetch-Site',
      value: 'same-origin'
    })
  }
  // Referer
  details.requestHeaders.push({
    name: 'Referer',
    value: 'https://www.facebook.com/'
  })
  // Host
  details.requestHeaders.push({
    name: 'Host',
    value: 'www.facebook.com'
  })

  // return back. continuely send out this request
  return { requestHeaders: details.requestHeaders }
}

const requestFilter = { urls: ['*://*.facebook.com/*'], types: ['xmlhttprequest'] }

chrome.webRequest.onBeforeSendHeaders.addListener(handleRequestHeaders,
  requestFilter, ['blocking', 'requestHeaders', 'extraHeaders'])

/**
 * 當按下 browserAction 按鈕實，觸發開啟 Counter 頁面的事件。
 * When client click browserAction button, trigger event of launch counter.
 */
chrome.browserAction.onClicked.addListener(async () => {
  // create app page
  chrome.tabs.create({ url: '/pages/app.html' })
})

// directly launch app on installed.
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    // create app page
    chrome.tabs.create({ url: '/pages/app.html' })
  }
})

// Mark beta version by badge.
const isRelease = !process.env.DEV && !process.env.ALPHA && !process.env.BETA
if (!isRelease) {
  const badgeText = (process.env.ALPHA) ? 'Alph' : ((process.env.BETA) ? 'Beta' : 'Dev')
  const badgeColor = (process.env.ALPHA) ? [0, 0, 255, 255] : ((process.env.BETA) ? [255, 0, 0, 255] : [239, 165, 15, 255])
  chrome.browserAction.setBadgeText({ text: badgeText })
  chrome.browserAction.setBadgeBackgroundColor({ color: badgeColor })
}
