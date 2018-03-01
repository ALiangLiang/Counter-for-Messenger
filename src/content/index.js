const __ = chrome.i18n.getMessage

if (location.pathname === '/login.php') {
  // location = location.href.replace(/#/, '%23')
  chrome.runtime.sendMessage({}, function () {
    alert(__('loginAlert'))
  })
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request === 'ping') {
    sendResponse('pong')
  }
})
