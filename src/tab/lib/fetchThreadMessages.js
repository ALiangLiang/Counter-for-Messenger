import { Message } from 'element-ui'
import isPathExist from './isPathExist.js'

function showErrorMsg () {
  Message({
    type: 'error',
    dangerouslyUseHTMLString: true,
    message: `<p><span>Oops, cannot fetch messages. </span><a href="https://github.com/ALiangLiang/Counter-for-Messenger/issues" target="_blank">Please contact developer.</a></p>`
  })
}

async function handleFetchError ({ token, thread, messageLimit, before }) {
  if (messageLimit < 1000) {
    showErrorMsg()
    return {
      messages: []
    }
  }
  try {
    return fetchThreadMessages({ token, thread, messageLimit, before })
  } catch (err) {
    return handleFetchError({ token, thread, messageLimit: messageLimit / 2, before })
  }
}

async function fetchThreadMessages ({ token, thread, messageLimit = 10000, before = null }) {
  const form = {
    batch_name: 'MessengerGraphQLThreadFetcher',
    fb_dtsg: token,
    client: 'mercury',
    __a: 1,
    counter: 'true',
    queries: {
      o0: {
        doc_id: '1479680738780118' || '1498317363570230',
        query_params: {
          id: thread.threadId,
          message_limit: messageLimit,
          load_messages: 1,
          load_read_receipts: true,
          before
        }
      }
    }
  }
  const body = Object.keys(form).map(function (key) {
    const val = (typeof form[key] === 'object')
      ? JSON.stringify(form[key]) : form[key]
    return encodeURIComponent(key) + ((form[key] !== undefined) ? ('=' + encodeURIComponent(val)) : '')
  }).join('&')
  const response = await fetch('https://www.messenger.com/api/graphqlbatch/', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'content-type': 'application/x-www-form-urlencoded; charset=utf-8',
      origin: 'https://www.messenger.com'
    },
    body
  })
  const resText = await response.text()
  const resJson = JSON.parse(resText.split('\n')[0])
  const messageThread = resJson.o0.data.message_thread
  if (!messageThread) {
    console.log(token, thread, form, resJson)
  }
  if (isPathExist(messageThread, 'messages.nodes')) {
    const messages = messageThread.messages.nodes
      .map((message) => ({
        senderId: message.message_sender.id,
        timestamp: message.timestamp_precise,
        text: (message.message) ? message.message.text : null,
        sticker: (message.sticker) ? message.sticker.url : null
      /* TODO: 抓取圖片。 */
      // blob_attachments: message.blob_attachments
      }))

    // 如果有下一頁，繼續 fetch。
    if (isPathExist(messageThread, 'messages.page_info.has_previous_page')) {
      let result = null
      try {
        result = await fetchThreadMessages({ token, thread, messageLimit, before: messages[0].timestamp })
      } catch (err) {
        // 發生錯誤，已一半的擷取數量重試一次。
        result = await handleFetchError({ token, thread, messageLimit: messageLimit / 2, before: messages[0].timestamp })
      }
      result.messages = messages.concat(result.messages)
      return result
    } else if (!messageThread.messages.page_info) {
      // 發生錯誤，已一半的擷取數量重試一次。
      const result = await handleFetchError({ token, thread, messageLimit: messageLimit / 2, before })
      result.messages = messages.concat(result.messages)
      return result
    } else {
      return {
        threadId: messageThread.thread_key.thread_fbid || messageThread.thread_key.other_user_id,
        messages
      }
    }
  } else return null
}

export default async function (args) {
  const result = await fetchThreadMessages(args)
  const { thread, $set } = args
  const textCount = result.messages.reduce((cur, message) =>
    ((message.text) ? message.text.length : 0) + cur, 0)
  if ($set) {
    $set(thread, 'messages', result.messages)
    $set(thread, 'textCount', textCount)
  } else {
    thread.messages = result.messages
    thread.textCount = textCount
  }
  return thread
}
