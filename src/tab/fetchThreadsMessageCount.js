export default async function fetchThreadsMessageCount (token) {
  const dataJson = {
    fb_dtsg: token,
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
          threadId: thread.thread_key.thread_fbid || thread.thread_key.other_user_id,
          name: otherUserName,
          tooltip: otherUserName,
          type: thread.thread_type,
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
          threadId: thread.thread_key.other_user_id || thread.thread_key.thread_fbid,
          name,
          tooltip,
          type: thread.thread_type,
          messages: null,
          messageCount: thread.messages_count
        }
      }
    })
    .sort((threadA, threadB) => threadB.messageCount - threadA.messageCount)
  return threads
}
