/// //////////////////////////////////////////////////////////////////////
// Fetch threads information used by Messenger native API. But this API //
// cannot get Messages.                                                 //
/// //////////////////////////////////////////////////////////////////////
import _get from 'lodash/get'
import _toString from 'lodash/toString'
import User from '../classes/User'
import { graphql, getQraphqlForm } from './util'
const __ = chrome.i18n.getMessage

function formatParticipant (participant, threadNode) {
  // Mapping participant nickname from threadNode.customization_info
  const participantCustomizations = (threadNode && threadNode.customization_info)
    ? threadNode.customization_info
      .participant_customizations
      .find((participantCustomization) => participantCustomization.participant_id === participant.id)
    : null

  return {
    id: participant.id,
    name: participant.name,
    nickname: (participantCustomizations) ? participantCustomizations.nickname : null,
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

function formatThread (threadNode) {
  const participants = threadNode.all_participants.nodes
    .map((participant) => {
      const user = new User(formatParticipant(participant.messaging_actor, threadNode))
      return {
        user,
        messageCount: null,
        characterCount: null,
        inGroup: true
      }
    })
  let type, threadName
  if (threadNode.thread_type === 'ONE_TO_ONE') {
    const otherUserId = threadNode.other_user_id
    const otherUser = participants.find((participant) =>
      participant.user.id !== otherUserId)
    type = (otherUser.user.type) ? otherUser.user.type.toUpperCase() : 'USER'

    if (!otherUser.user.type) console.warn(otherUser)

    threadName = otherUser.user.nickname || otherUser.user.name
  } else if (threadNode.thread_type === 'GROUP') {
    type = threadNode.thread_type

    // 如果沒有 thread 名稱，代表是沒有設定名稱的團體。
    // If no thread name, means it's no setting name group.
    threadName = (threadNode.name)
      ? threadNode.name
      : participants.slice(0, 3)
        .map((participant) => participant.user.name).join(__('comma')) +
      `${__('comma')}${__('others', String(participants.length - 3))}`
  } else {
    console.warn('Unknown thread type: ', threadNode)
    // TODO: handle with thread type 'ROOM' and 'MARKETPLACE'
    return null
  }

  return {
    id: threadNode.thread_key.other_user_id || threadNode.thread_key.thread_fbid,
    threadName,
    name: threadNode.name,
    image: (threadNode.image) ? threadNode.image.uri : null,
    emoji: _get(threadNode, 'customization_info.emoji', null),
    color: _toString(_get(threadNode, 'customization_info.outgoing_bubble_color', null)).replace(/^FF/, '#') || null,
    type,
    tag: threadNode.folder,
    muteUntil: (threadNode.mute_until === -1) ? Infinity : threadNode.mute_until,
    participants,
    otherUserId: threadNode.other_user_id,
    messageCount: threadNode.messages_count,
    characterCount: null
  }
}

export default async function fetchThread (jar, threadID) {
  // Prepare request form body.
  const queries = {
    o0: {
      doc_id: '1498317363570230',
      query_params: {
        id: threadID,
        message_limit: 0,
        load_messages: 0,
        load_read_receipts: false,
        before: null
      }
    }
  }
  const form = getQraphqlForm({ queries }, jar)
  const json = await graphql('https://www.facebook.com/api/graphqlbatch/', form)

  const threadData = json.o0.data.message_thread
  const thread = formatThread(threadData)
  return thread
}
