// import { Message } from 'element-ui'
// import _set from 'lodash/set'
// import _get from 'lodash/get'
// import isPathExist from './isPathExist.js'
import fetchService from './fetchService.js'
// import User from '../classes/User'
// const __ = chrome.i18n.getMessage

// function showErrorMsg () {
//   return Message({
//     type: 'error',
//     dangerouslyUseHTMLString: true,
//     message: `<p><span>${__('fetchError')} </span><a href="https://github.com/ALiangLiang/Counter-for-Messenger/issues" target="_blank">${__('contactDevelper')}</a></p>`
//   })
// }

// async function handleFetchError ({ token, threadId, messageCount, messageLimit, before }) {
//   messageLimit = messageLimit / 2
//   if (messageLimit <= 0) {
//     showErrorMsg()
//     return {
//       messages: []
//     }
//   }
//   try {
//     return fetchThreadDetail({ token, threadId, messageCount, messageLimit, before })
//   } catch (err) {
//     messageLimit = messageLimit / 2
//     return handleFetchError({ token, threadId, messageCount, messageLimit, before })
//   }
// }
//
function handleFetch ({ token, threadId, messageCount, messageLimit = 7500, before = null }) {
  messageLimit = Math.floor(Math.min(messageLimit, messageCount))

  // Prepare request form body.
  const form = {
    batch_name: 'MessengerGraphQLThreadFetcher',
    fb_dtsg: token, // It's required!!
    jazoest: '2' + Array.from(token).map((char) => char.charCodeAt(0)).join(''),
    client: 'mercury',
    __a: 1,
    counter: 'true',
    queries: {
      o0: {
        doc_id: '1583545408361109', // I'm not sure what is it.
        query_params: {
          id: threadId, // thread id
          message_limit: messageLimit, // limit of  fetching messages
          load_messages: 1,
          load_read_receipts: false,
          before // offset timestamp
        }
      }
    }
  }
  const body = Object.keys(form).map(function (key) {
    const val = (typeof form[key] === 'object')
      ? JSON.stringify(form[key]) : form[key]
    return encodeURIComponent(key) +
      ((form[key] !== undefined) ? ('=' + encodeURIComponent(val)) : '')
  }).join('&')

  // Fetch
  return fetchService('https://www.messenger.com/api/graphqlbatch/', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'content-type': 'application/x-www-form-urlencoded; charset=utf-8',
      origin: 'https://www.messenger.com'
    },
    body
  })
}

async function fetchThreadDetail ({ token, threadId, messageCount, messageLimit = 7500, before = null }) {
  const response = await handleFetch({ token, threadId, messageCount, messageLimit, before })
    .catch((err) => {
      console.error(err)
      messageLimit = messageLimit / 2
      return handleFetch({
        token, threadId, messageCount, messageLimit, before
      })
    })
  // Response and data handle.
  console.time('text')
  const resText = await response.text()
  console.timeEnd('text')
  console.time('split')
  const resTextLines = resText.split('\n')
  console.timeEnd('split')
  console.time('JSON.parse')
  const resJson = JSON.parse(resTextLines[0])
  console.timeEnd('JSON.parse')
  const messageThread = resJson.o0.data.message_thread
  if (!messageThread.messages.page_info) {
    throw new Error('No page_info.')
  }
  console.time('messages')
  const messages = messageThread.messages.nodes
    .map((message) => ({
      senderId: message.message_sender.id,
      timestamp: message.timestamp_precise,
      text: (message.message) ? message.message.text : null,
      sticker: (message.sticker) ? message.sticker.url : null
      /* TODO: 抓取圖片。 */
      // blob_attachments: message.blob_attachments
    }))
  console.timeEnd('messages')
  messageCount = messageCount - messages.length
  if (messageThread.messages.page_info.has_previous_page && messages[0] && messageCount) {
    return messages.concat(await fetchThreadDetail({
      token,
      threadId,
      messageCount,
      messageLimit,
      before: messages[0].timestamp
    }))
  } else {
    return messages
  }
  // if (!messageThread) {
  //   console.log(token, threadId, messageCount, form, resJson)
  //   // 發生錯誤，已一半的擷取數量重試一次。
  //   // An error occurred. Use half of limit and try again.
  //   const result = await handleFetchError({
  //     token,
  //     threadId,
  //     messageCount,
  //     messageLimit: messageLimit / 2,
  //     before
  //   })
  //   return result.messages
  // }
  // if (isPathExist(messageThread, 'messages.nodes')) {
  //   const messages = messageThread.messages.nodes
  //     .map((message) => ({
  //       senderId: message.message_sender.id,
  //       timestamp: message.timestamp_precise,
  //       text: (message.message) ? message.message.text : null,
  //       sticker: (message.sticker) ? message.sticker.url : null
  //       /* TODO: 抓取圖片。 */
  //       // blob_attachments: message.blob_attachments
  //     }))
  //
  //   messageCount -= messages.length
  //
  //   // 如果有上一頁，繼續 fetch。
  //   // If current request has previous page, continuesly fetch.
  //   if (isPathExist(messageThread, 'messages.page_info.has_previous_page')) {
  //     let result = null
  //     try {
  //       result = await fetchThreadDetail({
  //         token,
  //         threadId,
  //         messageCount,
  //         messageLimit,
  //         before: messages[0].timestamp
  //       })
  //     } catch (err) {
  //       // 發生錯誤，已一半的擷取數量重試一次。
  //       // An error occurred. Use half of limit and try again.
  //       result = await handleFetchError({
  //         token,
  //         threadId,
  //         messageCount,
  //         messageLimit,
  //         before: messages[0].timestamp
  //       })
  //     }
  //     result.messages = messages.concat(result.messages)
  //     return result
  //   } else if (!messageThread.messages.page_info) {
  //     // 發生錯誤，已一半的擷取數量重試一次。
  //     // An error occurred. Use half of limit and try again.
  //     const result = await handleFetchError({
  //       token,
  //       threadId,
  //       messageCount,
  //       messageLimit,
  //       before
  //     })
  //     result.messages = messages.concat(result.messages)
  //     return result
  //   } else {
  //     return {
  //       id: messageThread.thread_key.thread_fbid || messageThread.thread_key.other_user_id,
  //       messages
  //     }
  //   }
  // } else {
  //   // 發生錯誤，已一半的擷取數量重試一次。
  //   // An error occurred. Use half of limit and try again.
  //   const result = await handleFetchError({
  //     token,
  //     threadId,
  //     messageCount,
  //     messageLimit,
  //     before
  //   })
  //   return result.messages
  // }
}

export default async function (args) {
  const { thread,
    // $set,
    messageLimit, before, token } = args

  // If loading or loaded(has message), skip this action.
  // if (thread.messages || thread.isLoading) return thread

  // thread.isLoading = true

  // Copy thread and use it in fetch handler.
  const threadId = thread.id
  const messageCount = (messageLimit) ? Math.min(thread.messageCount, messageLimit) : thread.messageCount
  // Fetch thread detail information.
  /* const result = */return fetchThreadDetail({
    token, threadId, messageCount, messageLimit, before
  })

  // if (!$set) console.warn('Less of $set.')
  // const set = ($set)
  //   ? (object, key, value) => $set(object, key, value)
  //   : (object, key, value) => (object[key] = value)

  // Culculate total text count of this thread.
  // const threadTextCount = result.messages.reduce((cur, message) =>
  //   ((message.text) ? message.text.length : 0) + cur, 0)
  // Statistic messages with every participants.
  // const participantsStats = {}
  // result.messages.forEach((message) => {
  //   const participantStats = participantsStats[message.senderId]
  //   _set(participantsStats, `${message.senderId}.messageCount`,
  //     _get(participantStats, 'messageCount', 0) + 1)
  //   _set(participantsStats, `${message.senderId}.textCount`,
  //     _get(participantStats, 'textCount', 0) + message.textLength)
  // })
  // Set statistic results on Thread Object.
  // Don't let vue instance trigger "messages". Will cause memory leak.
  // thread.messages = result.messages
  // thread.textCount = threadTextCount
  // set(thread, 'textCount', threadTextCount)
  // Object.keys(participantsStats)
  //   .forEach((participantId) => {
  //     const participantStats = participantsStats[participantId]
  //     let messageSender = thread.getParticipantById(participantId)
  //     if (messageSender) {
  //       // set(messageSender, 'messageCount', participantStats.messageCount)
  //       // set(messageSender, 'textCount', participantStats.textCount)
  //       messageSender.messageCount = participantStats.messageCount
  //       messageSender.textCount = participantStats.textCount
  //     } else { // This sender is not inside the thread.
  //       messageSender = {
  //         user: new User({
  //           id: participantId,
  //           name: null,
  //           type: null,
  //           url: null
  //         }),
  //         messageCount: participantStats.messageCount,
  //         textCount: participantStats.textCount,
  //         inGroup: false
  //       }
  //       thread.participants.push(messageSender)
  //     }
  //   })
  //
  // thread.isLoading = false
  // return thread
}
