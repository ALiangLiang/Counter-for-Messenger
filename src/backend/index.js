/**
 * 用來做偽造 origin header，模擬 www.messenger.com 網域環境。
 */
function handleRequestHeaders (details) {
  const headerOrigin = details.requestHeaders.find((header) => header.name.toUpperCase() === 'ORIGIN')
  if (headerOrigin) headerOrigin.value = 'https://www.messenger.com'
  return { requestHeaders: details.requestHeaders,
    redirectUrl: details.url }
}
chrome.webRequest.onBeforeSendHeaders.addListener(handleRequestHeaders,
  { urls: ['*://www.messenger.com/api/graphqlbatch/'] }, ['blocking', 'requestHeaders'])

/**
 * 當按下 browserAction 按鈕實，觸發開啟 Counter 頁面的事件。
 */
chrome.browserAction.onClicked.addListener(async () => {
  // 跳出我們的 Dashboard。
  chrome.tabs.create({ url: 'pages/app.html' })
})

/**
 * 當跳出的 Messenger 頁面需要登入時，highlight 那個頁面，提醒使用者登入 Messenger。
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  chrome.tabs.highlight({ tabs: sender.tab.index }, () => {
    sendResponse()
  })
  return true
})
