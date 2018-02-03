import _get from 'lodash/get'
const __ = chrome.i18n.getMessage

function createThreadObject (threadNode) {
  const participants = threadNode.all_participants.nodes
    .map((participant) => ({
      id: participant.messaging_actor.id,
      name: participant.messaging_actor.name,
      type: _get(participant, 'messaging_actor.__typename', '').toUpperCase(),
      url: participant.messaging_actor.url,
      messageCount: null,
      textCount: null,
      inGroup: true
    }))

  // Initial thread object.
  const thread = {
    id: null,
    name: null,
    tooltip: null,
    type: null,
    messages: null,
    participants,
    messageCount: threadNode.messages_count,
    textCount: null
  }

  if (threadNode.thread_type === 'ONE_TO_ONE') {
    const otherUserId = threadNode.other_user_id
    const otherUser = participants.find((participant) =>
      participant.id !== otherUserId)
    const otherUserName = otherUser.name

    if (otherUserName === null) console.warn(threadNode)
    if (!otherUser.type) {
      console.warn(otherUser)
    }

    Object.assign(thread, {
      id: threadNode.thread_key.thread_fbid || threadNode.thread_key.other_user_id,
      name: otherUserName,
      tooltip: otherUserName,
      type: (otherUser.type) ? otherUser.type.toUpperCase() : 'USER'
    })
  } else if (threadNode.thread_type === 'GROUP') {
    // 預設使用 thread 名稱作為顯示名稱標籤。
    // By default, use thread name as display tooltip.
    let name = threadNode.name
    const tooltip = participants
      .map((participant) => participant.name)
      .join(__('comma'))
    // 如果沒有 thread 名稱，代表是沒有設定名稱的團體。
    // If no thread name, means it's no setting name group.
    if (threadNode.name === null) {
      name = tooltip
      if (participants.length > 3) {
        name = participants.slice(0, 3)
          .map((user) => user.name).join(__('comma'))
        name += `${__('comma')}${__('others', threadNode.all_participants.nodes.length - 3)}`
      }
    }

    Object.assign(thread, {
      id: threadNode.thread_key.other_user_id || threadNode.thread_key.thread_fbid,
      name,
      tooltip,
      type: threadNode.thread_type
    })
  }

  return thread
}

export default async function fetchThreads (token) {
  // Prepare request form body.
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

  // Fetch
  const response = await fetch('https://www.messenger.com/api/graphqlbatch/', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'content-type': 'application/x-www-form-urlencoded; charset=utf-8',
      origin: 'https://www.messenger.com'
    },
    body: form
  })

  // Response and data handle.
  const body = await response.text()
  const json = JSON.parse(body.split('\n')[0])
  const threads = json.o0.data.viewer.message_threads.nodes
    .map(createThreadObject)
    // Sort by message count. From more to less.
    .sort((threadA, threadB) => threadB.messageCount - threadA.messageCount)
  return threads
}
