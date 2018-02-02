import { Message } from 'element-ui'

function showErrorMsg () {
  Message({
    type: 'error',
    dangerouslyUseHTMLString: true,
    message: `<p><span>Oops, cannot fetch messages. </span><a href="https://github.com/ALiangLiang/Counter-for-Messenger/issues" target="_blank">Please contact developer.</a></p>`
  })
}

async function handleFetchError ({ token, threadId, messageLimit, before }) {
  if (messageLimit < 1000) {
    showErrorMsg()
    return {
      messages: []
    }
  }
  try {
    return fetchThreadMessages({ token, threadId, messageLimit, before })
  } catch (err) {
    return handleFetchError({ token, threadId, messageLimit: messageLimit / 2, before })
  }
}

async function fetchThreadMessages ({ token, threadId, messageLimit = 10000, before = null }) {
  const dataJson = {
    batch_name: 'MessengerGraphQLThreadFetcher',
    fb_dtsg: token,
    client: 'mercury',
    __a: 1,
    counter: 'true',
    queries: {
      o0: {
        doc_id: '1479680738780118' || '1498317363570230',
        query_params: {
          id: threadId,
          message_limit: messageLimit,
          load_messages: 1,
          load_read_receipts: true,
          before
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
  const thread = json.o0.data.message_thread
  if (!thread) {
    console.log(token, threadId, dataJson, json)
  }
  if (thread && thread.messages && thread.messages.nodes) {
    const messages = thread.messages.nodes
      .map((message) => ({
        senderId: message.message_sender.id,
        timestamp: message.timestamp_precise,
        text: (message.message) ? message.message.text : null,
        sticker: (message.sticker) ? message.sticker.url : null
      /* TODO: 抓取圖片。 */
      // blob_attachments: message.blob_attachments
      }))

    // 如果有下一頁，繼續 fetch。
    if (thread.messages.page_info && thread.messages.page_info.has_previous_page) {
      let result = null
      try {
        result = await fetchThreadMessages({ token, threadId, messageLimit, before: messages[0].timestamp })
      } catch (err) {
        // 發生錯誤，已一半的擷取數量重試一次。
        result = await handleFetchError({ token, threadId, messageLimit: messageLimit / 2, before: messages[0].timestamp })
      }
      result.messages = messages.concat(result.messages)
      return result
    } else if (!thread.messages.page_info) {
      // 發生錯誤，已一半的擷取數量重試一次。
      const result = await handleFetchError({ token, threadId, messageLimit: messageLimit / 2, before })
      result.messages = messages.concat(result.messages)
      return result
    } else {
      return {
        threadId: thread.thread_key.thread_fbid || thread.thread_key.other_user_id,
        messages
      }
    }
  } else return null
}

export default handleFetchError
