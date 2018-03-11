// submit a message about submit. means "login"
console.log(0)
document.addEventListener('submit', function () {
  console.log(chrome)
  chrome.runtime.sendMessage({})
})
console.log(1)
