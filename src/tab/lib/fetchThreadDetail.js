import { Message } from 'element-ui'
import _set from 'lodash/set'
import _get from 'lodash/get'
import isPathExist from './isPathExist.js'
const __ = chrome.i18n.getMessage

function showErrorMsg () {
  return Message({
    type: 'error',
    dangerouslyUseHTMLString: true,
    message: `<p><span>${__('fetchError')} </span><a href="https://github.com/ALiangLiang/Counter-for-Messenger/issues" target="_blank">${__('contactDevelper')}</a></p>`
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
    return fetchThreadDetail({ token, thread, messageLimit, before })
  } catch (err) {
    return handleFetchError({ token, thread, messageLimit: messageLimit / 2, before })
  }
}

async function fetchThreadDetail ({ token, thread, messageLimit = 10000, before = null }) {
  // Prepare request form body.
  const form = {
    batch_name: 'MessengerGraphQLThreadFetcher',
    fb_dtsg: token, // It's required!!
    client: 'mercury',
    __a: 1,
    counter: 'true',
    queries: {
      o0: {
        doc_id: '1479680738780118' || '1498317363570230', // I'm not sure what is it.
        query_params: {
          id: thread.id, // thread id
          message_limit: messageLimit, // limit of  fetching messages
          load_messages: 1,
          load_read_receipts: true,
          before // offset timestamp
        }
      }
    }
  }
  const body = Object.keys(form).map(function (key) {
    const val = (typeof form[key] === 'object')
      ? JSON.stringify(form[key]) : form[key]
    return encodeURIComponent(key) + ((form[key] !== undefined) ? ('=' + encodeURIComponent(val)) : '')
  }).join('&')

  // Fetch
  const response = await fetch('https://www.messenger.com/api/graphqlbatch/', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'content-type': 'application/x-www-form-urlencoded; charset=utf-8',
      origin: 'https://www.messenger.com'
    },
    body
  })

  // Response and data handle.
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

    // 如果有上一頁，繼續 fetch。
    // If current request has previous page, continuesly fetch.
    if (isPathExist(messageThread, 'messages.page_info.has_previous_page')) {
      let result = null
      try {
        result = await fetchThreadDetail({ token, thread, messageLimit, before: messages[0].timestamp })
      } catch (err) {
        // 發生錯誤，已一半的擷取數量重試一次。
        // An error occurred. Use half of limit and try again.
        result = await handleFetchError({ token, thread, messageLimit: messageLimit / 2, before: messages[0].timestamp })
      }
      result.messages = messages.concat(result.messages)
      return result
    } else if (!messageThread.messages.page_info) {
      // 發生錯誤，已一半的擷取數量重試一次。
      // An error occurred. Use half of limit and try again.
      const result = await handleFetchError({ token, thread, messageLimit: messageLimit / 2, before })
      result.messages = messages.concat(result.messages)
      return result
    } else {
      return {
        id: messageThread.thread_key.thread_fbid || messageThread.thread_key.other_user_id,
        messages
      }
    }
  } else return null
}

export default async function (args) {
  // Fetch thread detail information.
  const result = await fetchThreadDetail(args)

  const { thread, $set } = args
  if (!$set) console.error('Less of $set.')
  const set = ($set)
    ? (object, key, value) => $set(object, key, value)
    : (object, key, value) => (object[key] = value)

  // Culculate total text count of this thread.
  const threadTextCount = result.messages.reduce((cur, message) =>
    ((message.text) ? message.text.length : 0) + cur, 0)
  // Statistic messages with every participants.
  const participantsStats = {}
  result.messages.forEach((message) => {
    const participantStats = participantsStats[message.senderId]
    _set(participantsStats, `${message.senderId}.messageCount`,
      _get(participantStats, 'messageCount', 0) + 1)
    _set(participantsStats, `${message.senderId}.textCount`,
      _get(participantStats, 'textCount', 0) + (message.text || '').length)
  })
  // Set statistic results on Thread Object.
  set(thread, 'messages', result.messages)
  set(thread, 'textCount', threadTextCount)
  Object.keys(participantsStats)
    .forEach((participantId) => {
      const participantStats = participantsStats[participantId]
      let messageSender = thread.participants.find((participant) =>
        participant.id === participantId)
      if (messageSender) {
        set(messageSender, 'messageCount', participantStats.messageCount)
        set(messageSender, 'textCount', participantStats.textCount)
      } else { // This sender not inside the thread.
        messageSender = {
          id: participantId,
          name: null,
          type: null,
          url: null,
          messageCount: participantStats.messageCount,
          textCount: participantStats.textCount,
          inGroup: false
        }
        thread.participants.push(messageSender)
      }
    })

  return thread
}
