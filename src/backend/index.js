/**
 * 用來做偽造 origin header，模擬 www.facebook.com 網域環境。
 * Use to replace header "Origin". Simulate environment of "www.facebook.com".
 */
function handleRequestHeaders (details) {
  const headerOrigin = details.requestHeaders.find((header) => header.name.toUpperCase() === 'ORIGIN')
  if (headerOrigin) headerOrigin.value = new URL(details.url).origin
  return { requestHeaders: details.requestHeaders }
}
chrome.webRequest.onBeforeSendHeaders.addListener(handleRequestHeaders,
  { urls: ['*://www.facebook.com/*', '*://www.messenger.com/*'] }, ['blocking', 'requestHeaders'])

/**
 * 當按下 browserAction 按鈕實，觸發開啟 Counter 頁面的事件。
 * When client click browserAction button, trigger event of launch counter.
 */
chrome.browserAction.onClicked.addListener(async () => {
  // 跳出我們的 Dashboard。
  chrome.tabs.create({ url: '/pages/app.html' })
})
