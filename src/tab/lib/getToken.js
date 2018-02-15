/**
 * Intercept token from Messenger page.
 * @return {Promise<{token, selfId}>} return a Promise include "token" and "selfId"
 */
export default function getToken () {
  /* eslint-disable promise/param-names */
  return new Promise((resolveInfo, reject) => {
    /**
     * 建立用來攔截 Messenger API Request，擷取所需的 token 等資訊。
     * Create a listener. Used to intercept token from Messenger page.
     */
    const setGetTokenListener = () => new Promise((resolve) =>
      chrome.webRequest.onBeforeRequest.addListener(async function handleIntercept (details) {
        if (details.requestBody.formData && details.requestBody.formData.fb_dtsg[0]) {
          // 取得 token！ 立即取消 listener。
          // Got token!! Destroy listener immediately.
          chrome.webRequest.onBeforeRequest.removeListener(handleIntercept)
          resolve()
        } else return // 否則繼續監聽下一筆目標 request。
        return resolveInfo({
          token: details.requestBody.formData.fb_dtsg[0],
          selfId: details.requestBody.formData.__user[0]
        })
      }, {
        urls: ['*://www.messenger.com/api/graphqlbatch/'],
        types: ['xmlhttprequest']
      }, ['requestBody']))

    let messengerTabId = null
    // 首先建立監聽 token 等資訊的 listener。
    // First, we set up a listener. Used to intercept token from Messenger page.
    setGetTokenListener()
      .then(() => {
        if (messengerTabId) {
          chrome.tabs.remove(messengerTabId)
        }
      })
    // 建立 Messenger 頁面，讓它發送帶有 token 的 request。
    // Create a Messenger page. Let it send a request with token.
    chrome.tabs.create({
      url: 'https://www.messenger.com/t/ALiangLiang.top#counter-for-messenger',
      active: false
    }, (tab) => {
      messengerTabId = tab.id

      /**
       * Setup ping/pong. We can make ping to test is Messenger page fine after
       * loading completey.
       */
      let pingTimes = 0
      const intervalId = setInterval(() => {
        // Get Messenger page status.
        chrome.tabs.get(messengerTabId, (tab) => {
          if (!tab) {
            return clearInterval(intervalId)
          }
          // If status is "complete", ping it.
          if (tab.status === 'complete') {
            pingTimes += 1
            chrome.runtime.sendMessage('ping', function (response) {
              if (response === 'pong') { // Means Messenger page is fine.
                clearInterval(intervalId)
              }
            })
          }
        })

        // If ping 3 times and content script not response, Messenger is dead
        // for your account. Maybe request API too much times or Messenger
        // service is really dead.
        if (pingTimes >= 3) {
          clearInterval(intervalId)
          chrome.tabs.remove(messengerTabId)
          return reject(new Error('Messenger is dead'))
        }
      }, 2000)
    })
  })
}
