const __ = chrome.i18n.getMessage

if (location.pathname === '/login.php' &&
  location.search === '?next=https%3A%2F%2Fwww.messenger.com%2Ft%2FALiangLiang.top%23counter-for-messenger') {
  // location = location.href.replace(/#/, '%23')
  chrome.runtime.sendMessage({}, function () {
    alert(__('loginAlert'))
  })
}
