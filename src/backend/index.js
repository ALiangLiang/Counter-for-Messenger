import { fb } from '../../core/.env.js'

// get url origin of self
const selfOrigin = document.location.origin

/**
 * 用來做偽造 origin header，模擬 www.facebook.com 網域環境。
 * Use to replace header "Origin". Simulate environment of "www.facebook.com".
 */
function handleRequestHeaders (details) {
  // find the origin header
  const headerOrigin = details.requestHeaders.find((header) => header.name.toUpperCase() === 'ORIGIN')

  // exit on no origin found or request not send from this extension.
  // In Chrome, origin is set as string 'null'. In firefox, origin is set as origin self extension.
  if (!headerOrigin || (headerOrigin.value !== 'null' && headerOrigin.value !== selfOrigin)) return

  // if found, set header origin with url origin of it self.
  headerOrigin.value = new URL(details.url).origin

  // return back. continuely send out this request
  return { requestHeaders: details.requestHeaders }
}

const requestFilter = { urls: ['*://*.facebook.com/*'], types: ['xmlhttprequest'] }

chrome.webRequest.onBeforeSendHeaders.addListener(handleRequestHeaders,
  requestFilter, ['blocking', 'requestHeaders'])

chrome.webRequest.onBeforeRequest.addListener(function (details) {
  const url = new URL(details.url)
  if (url.search.match(/ldlagicdigidgnhniajpmoddkoakdoca/)) {
    url.search = url.search.replace(/domain=.*?&/g, `domain=${fb.domain}&`)
    url.search = url.search.replace(/domain%3D.*?%26/g, `domain%3D${fb.domain}%26`)
    url.search = url.search.replace(/origin%3D.*?%26/g, `origin%3D${encodeURIComponent(encodeURIComponent(fb.website))}%26`)
  }
  return { redirectUrl: url.href }
}, { urls: ['https://www.facebook.com/*'] }, ['blocking'])

/**
 * 當按下 browserAction 按鈕實，觸發開啟 Counter 頁面的事件。
 * When client click browserAction button, trigger event of launch counter.
 */
chrome.browserAction.onClicked.addListener(async () => {
  // create app page
  chrome.tabs.create({ url: '/pages/app.html' })
})
