/// //////////////////////////////////////////////////////////////////////
// Fetch threads information used by Messenger native API. But this API //
// cannot get Messages.                                                 //
/// //////////////////////////////////////////////////////////////////////
import _get from 'lodash/get'
import Threads from '../classes/Threads'
import Thread from '../classes/Thread'
import User from '../classes/User'
import { graphql, getQraphqlForm } from './util'
const __ = chrome.i18n.getMessage

function formatParticipant (participant) {
  return {
    id: participant.id,
    name: participant.name,
    type: _get(participant, '__typename', '').toUpperCase(),
    url: participant.url,
    gender: participant.gender,
    shortName: participant.short_name,
    username: participant.username,
    avatar: (participant.big_image_src) ? participant.big_image_src.uri : null,
    isViewerFriend: participant.is_viewer_friend,
    isMessengerUser: participant.is_messenger_user,
    isVerified: participant.is_verified,
    isNessageBlockedByViewer: participant.is_message_blocked_by_viewer,
    isViewerCoworker: participant.is_viewer_coworker,
    isEmployee: participant.is_employee
  }
}

function createThreadObject (threadNode, createdUsers, tag) {
  const participantsData = threadNode.all_participants.nodes
    .map((participant) => {
      // Find user we ever created.
      const createdUser = createdUsers.find((user) => user.id === participant.messaging_actor.id)
      // If not found, create one and push it to array "createdUsers".
      let user = createdUser
      if (!user) {
        user = new User(formatParticipant(participant.messaging_actor))
        createdUsers.push(user)
      }
      return {
        user,
        messageCount: null,
        characterCount: null,
        inGroup: true
      }
    })

  // Initial thread object.
  const thread = new Thread({
    participants: participantsData,
    messageCount: threadNode.messages_count,
    tag
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
        name += `${__('comma')}${__('others', String(participants.length - 3))}`
      }
    }

    Object.assign(thread, {
      id: threadNode.thread_key.other_user_id || threadNode.thread_key.thread_fbid,
      name,
      tooltip,
      type: threadNode.thread_type
    })
  } else {
    console.warn('Unknown thread type: ', threadNode)
    // TODO: handle with thread type 'ROOM' and 'MARKETPLACE'
    return null
  }

  return thread
}

export default async function fetchThreads (jar, limit = 5000, tags = [ 'INBOX', 'ARCHIVED', 'PENDING' ]) {
  const threadsData = (await Promise.all(tags.map(async (tag) => {
    // Prepare request form body.
    const queries = {
      o0: {
        doc_id: '1475048592613093',
        query_params: {
          limit,
          before: null,
          tags: [tag],
          includeDeliveryReceipts: true,
          includeSeqID: false
        }
      }
    }
    const form = getQraphqlForm(queries, jar)
    const json = await graphql('https://www.facebook.com/api/graphqlbatch/', form)

    const createdUsers = [] // Use to record user we created.
    return json.o0.data.viewer.message_threads.nodes
      .map((threadsData) => createThreadObject(threadsData, createdUsers, tag))
      .filter((thread) => !!thread)
  })))
    .reduce((cur, threadsData) => cur.concat(threadsData), [])
    // Sort by message count. From more to less.
    .sort((threadA, threadB) => threadB.messageCount - threadA.messageCount)

  return new Threads(threadsData)
}
