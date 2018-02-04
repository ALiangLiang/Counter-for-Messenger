import _get from 'lodash/get'
import Threads from '../classes/Threads'
import Thread from '../classes/Thread'
import User from '../classes/User'
const __ = chrome.i18n.getMessage

function createThreadObject (threadNode, createdUsers) {
  const participantsData = threadNode.all_participants.nodes
    .map((participant) => {
      // Find user we ever created.
      const createdUser = createdUsers.find((user) => user.id === participant.messaging_actor.id)
      // If not found, create one and push it to array "createdUsers".
      let user = createdUser
      if (!user) {
        user = new User({
          id: participant.messaging_actor.id,
          name: participant.messaging_actor.name,
          type: _get(participant, 'messaging_actor.__typename', '').toUpperCase(),
          url: participant.messaging_actor.url
        })
        createdUsers.push(user)
      }
      return {
        user,
        messageCount: null,
        textCount: null,
        inGroup: true
      }
    })

  // Initial thread object.
  const thread = new Thread({
    participants: participantsData,
    messages: null,
    messageCount: threadNode.messages_count,
    textCount: null
  })
  const { participants } = thread

  if (threadNode.thread_type === 'ONE_TO_ONE') {
    const otherUserId = threadNode.other_user_id
    const otherUser = participants.find((participant) =>
      participant.user.id !== otherUserId)
    const otherUserName = otherUser.user.name

    if (otherUserName === null) console.warn(threadNode)
    if (!otherUser.user.type) console.warn(otherUser)

    Object.assign(thread, {
      id: threadNode.thread_key.thread_fbid || threadNode.thread_key.other_user_id,
      name: otherUserName,
      tooltip: otherUserName,
      type: (otherUser.user.type) ? otherUser.user.type.toUpperCase() : 'USER'
    })
  } else if (threadNode.thread_type === 'GROUP') {
    // 預設使用 thread 名稱作為顯示名稱標籤。
    // By default, use thread name as display tooltip.
    let name = threadNode.name
    const tooltip = participants
      .map((participant) => participant.user.name)
      .join(__('comma'))
    // 如果沒有 thread 名稱，代表是沒有設定名稱的團體。
    // If no thread name, means it's no setting name group.
    if (threadNode.name === null) {
      name = tooltip
      if (participants.length > 3) {
        name = participants.slice(0, 3)
          .map((participant) => participant.user.name).join(__('comma'))
        name += `${__('comma')}${__('others', participants.length - 3)}`
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
  const createdUsers = [] // Use to record user we created.
  const threadsData = json.o0.data.viewer.message_threads.nodes
    .map((threadsData) => createThreadObject(threadsData, createdUsers))
    // Sort by message count. From more to less.
    .sort((threadA, threadB) => threadB.messageCount - threadA.messageCount)

  return new Threads(threadsData)
}
