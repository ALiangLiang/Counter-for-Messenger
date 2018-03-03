// submit a message about submit. means "login"
document.addEventListener('submit', function () {
  chrome.runtime.sendMessage({})
})
