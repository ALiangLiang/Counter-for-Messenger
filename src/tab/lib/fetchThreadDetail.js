/// //////////////////////////////////////////////////////////////////////////////
// Fetch thread detail information (include messages). And parse every message. //
/// //////////////////////////////////////////////////////////////////////////////
import fetchService from './fetchService.js'

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
      if (messageLimit > 1000) {
        return handleFetch({
          token, threadId, messageCount, messageLimit, before
        })
      } else { throw new Error('Too many error on fetch.') }
    })
  // Response and data handle.
  const resText = await response.text()
  const resTextLines = resText.split('\n')
  const resJson = JSON.parse(resTextLines[0])
  const messageThread = resJson.o0.data.message_thread
  if (!messageThread.messages.page_info) {
    throw new Error('No page_info.')
  }
  const messages = messageThread.messages.nodes
    .map((message) => ({
      senderId: message.message_sender.id,
      timestamp: message.timestamp_precise,
      text: (message.message) ? message.message.text : null,
      sticker: (message.sticker) ? message.sticker.url : null
      /* TODO: 抓取圖片。 */
      // blob_attachments: message.blob_attachments
    }))
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
}

export default async function (args) {
  const { thread, messageLimit, before, token } = args

  // Copy thread and use it in fetch handler.
  const threadId = thread.id
  const messageCount = (messageLimit) ? Math.min(thread.messageCount, messageLimit) : thread.messageCount
  // Fetch thread detail information.
  return fetchThreadDetail({
    token, threadId, messageCount, messageLimit, before
  })
}
