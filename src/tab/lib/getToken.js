export default function fetchThreads () {
  /* eslint-disable promise/param-names */
  return new Promise((resolveInfo) => {
    /**
     * 建立用來攔截 Messenger API Request，擷取所需的 token 等資訊。
     */
    const setGetTokenListener = () => new Promise((resolve) =>
      chrome.webRequest.onBeforeRequest.addListener(async function handleIntercept (details) {
        if (details.requestBody.formData && details.requestBody.formData.fb_dtsg[0]) {
          // 取得 token！ 立即取消 listener。
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
    setGetTokenListener()
      .then(() => {
        if (messengerTabId) {
          chrome.tabs.remove(messengerTabId)
        }
      })
    // 建立 Messenger 頁面，讓它發送帶有 token 的 request。
    chrome.tabs.create({
      url: 'https://www.messenger.com/t/ALiangLiang.top#counter-for-messenger',
      active: false
    }, (tab) => {
      messengerTabId = tab.id
    })
  })
}
