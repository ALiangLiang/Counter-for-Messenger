export default function fetchThreadsMessageCount () {
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

        const dataJson = {
          fb_dtsg: details.requestBody.formData.fb_dtsg[0],
          __a: 1,
          counter: 'true',
          queries: {
            o0: {
              doc_id: '1475048592613093',
              query_params: {
                limit: 5000,
                before: null,
                tags: ['INBOX'],
                includeDeliveryReceipts: true,
                includeSeqID: false
              }
            }
          }
        }
        const form = Object.keys(dataJson).map(function (key) {
          const val = (typeof dataJson[key] === 'object')
            ? JSON.stringify(dataJson[key]) : dataJson[key]
          return encodeURIComponent(key) + ((dataJson[key] !== undefined) ? ('=' + encodeURIComponent(val)) : '')
        }).join('&')
        const response = await fetch('https://www.messenger.com/api/graphqlbatch/', {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'content-type': 'application/x-www-form-urlencoded; charset=utf-8',
            origin: 'https://www.messenger.com'
          },
          body: form
        })
        const body = await response.text()
        const json = JSON.parse(body.split('\n')[0])
        const threads = json.o0.data.viewer.message_threads.nodes
          .map((thread) => {
            if (thread.thread_type === 'ONE_TO_ONE') {
              const otherUserId = thread.other_user_id
              const participants = thread.all_participants.nodes
              const otherUserName = participants.find((user) =>
                user.messaging_actor.id !== otherUserId).messaging_actor.name
              if (otherUserName === null) console.log(thread)
              return {
                name: otherUserName,
                label: otherUserName,
                messageCount: thread.messages_count
              }
            } else if (thread.thread_type === 'GROUP') {
              // 預設使用 thread 名稱作為顯示名稱標籤。
              let name = thread.name
              let tooltip = thread.name
              // 如果沒有 thread 名稱，代表是沒有設定名稱的團體。
              if (thread.name === null) {
                tooltip = thread.all_participants.nodes
                  .map((user) => user.messaging_actor.name).join('、' || ', ')
                name = tooltip
                if (thread.all_participants.nodes.length > 3) {
                  name = thread.all_participants.nodes.slice(0, 3)
                    .map((user) => user.messaging_actor.name).join('、' || ', ')
                  name += `, ${thread.all_participants.nodes.length - 3} Others`
                }
              }
              return {
                name,
                tooltip,
                messageCount: thread.messages_count
              }
            }
          })
          .sort((threadA, threadB) => threadB.messageCount - threadA.messageCount)
        return resolveInfo(threads)
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
