/// //////////////////////////////////////////////////////////////////////////////
// Fetch thread detail information (include messages). And parse every message. //
/// //////////////////////////////////////////////////////////////////////////////
import _compact from 'lodash/compact'
import { graphql, getQraphqlForm } from './util'

function handleFetch ({ jar, senderID, messageCount, messageLimit = 7500, before = null }) {
  messageLimit = Math.floor(Math.min(messageLimit, messageCount))

  // Prepare request form body.
  const queries = {
    o0: {
      doc_id: '1583545408361109', // I'm not sure what is it.
      query_params: {
        id: senderID, // thread id
        message_limit: messageLimit, // limit of  fetching messages
        load_messages: 1,
        load_read_receipts: false,
        before // offset timestamp
      }
    }
  }
  const form = getQraphqlForm({ queries }, jar)
  return graphql('https://www.facebook.com/api/graphqlbatch/', form)
}

// Shamely copy from https://github.com/KevinSalmon/facebook-chat-api/blob/6cb19d038a35c92dc8ac6d6250c0ed34981e86ea/src/getThreadHistoryGraphQL.js
function formatAttachmentsGraphQLResponse (attachment) {
  switch (attachment.__typename) {
    case 'MessageImage': {
      return {
        // You have to query for the real image. See below.
        url: '',
        width: 0,
        height: 0,

        // Both gifs and images have this type now. Just to be consistent with
        // FB, and there doesn't seem to be many drawbacks.
        type: 'image',
        filename: attachment.filename,
        attachmentID: attachment.legacy_attachment_id,
        previewHeight: attachment.preview.height,
        previewUrl: attachment.preview.uri,
        previewWidth: attachment.preview.width,
        thumbnailUrl: attachment.thumbnail.uri,

        attributionApp: attachment.attribution_app ? {
          attributionAppID: attachment.attribution_app.id,
          name: attachment.attribution_app.name,
          logo: attachment.attribution_app.square_logo
        } : null,

        extension: attachment.original_extension,

        // @TODO No idea what this is, should we expose it?
        //      Ben - July 15th 2017
        // renderAsSticker: attachment.render_as_sticker,

        // This is _not_ the real URI, this is still just a large preview.
        // To get the URL we'll need to support a POST query to
        //
        //    https://www.facebook.com/webgraphql/query/
        //
        // With the following query params:
        //
        //    query_id:728987990612546
        //    variables:{"id":"100009069356507","photoID":"10213724771692996"}
        //    dpr:1
        //
        // No special form though.
        largePreviewUrl: attachment.large_preview.uri,
        largePreviewHeight: attachment.large_preview.height,
        largePreviewWidth: attachment.large_preview.width
      }
    }
    case 'MessageAnimatedImage':
      return {
        type: 'image',
        filename: attachment.filename,
        attachmentID: attachment.legacy_attachment_id,
        previewHeight: attachment.preview_image.height,
        previewUrl: attachment.preview_image.uri,
        previewWidth: attachment.preview_image.width,
        largePreviewUrl: attachment.animated_image.uri,
        largePreviewHeight: attachment.animated_image.height,
        largePreviewWidth: attachment.animated_image.width,

        attributionApp: attachment.attribution_app ? {
          attributionAppID: attachment.attribution_app.id,
          name: attachment.attribution_app.name,
          logo: attachment.attribution_app.square_logo
        } : null
      }
    case 'MessageVideo':
      return {
        // Deprecated fields.
        previewHeight: '',
        previewUrl: '',
        previewWidth: '',

        type: 'video',
        thumbnailUrl: attachment.large_image.uri,
        filename: attachment.filename,
        height: attachment.original_dimensions.y,
        width: attachment.original_dimensions.x,
        attachmentID: attachment.legacy_attachment_id,
        url: attachment.playable_url,

        duration: attachment.playable_duration_in_ms,
        thumbnailWidth: attachment.large_image.width,
        thumbnailHeight: attachment.large_image.height,
        // Not sure what this is.
        //    Ben - July 15th 2017
        videoType: attachment.video_type.toLowerCase()
      }
    case 'MessageFile':
      return {
        attachmentID: attachment.url_shimhash, // Should be good enough as an ID
        isMalicious: attachment.is_malicious,
        type: 'file',
        url: attachment.url,

        contentType: attachment.content_type,
        filename: attachment.filename
      }
    case 'MessageAudio':
      return {
        attachmentID: attachment.url_shimhash, // Copied from above

        type: 'audio',
        audioType: attachment.audio_type,
        duration: attachment.playable_duration_in_ms,
        url: attachment.playable_url,

        isVoiceMail: attachment.is_voicemail,
        filename: attachment.filename
      }
    default:
      console.log(attachment)
      return console.error('Don\'t know about attachment type ' + attachment.__typename)
  }
}

function formatEventData (event) {
  if (event == null) {
    return {}
  }

  switch (event.__typename) {
    case 'ThemeColorExtensibleMessageAdminText':
      return {
        color: event.theme_color
      }
    case 'ThreadNicknameExtensibleMessageAdminText':
      return {
        nickname: event.nickname,
        participantID: event.participant_id
      }
    case 'ThreadIconExtensibleMessageAdminText':
      return {
        threadIcon: event.thread_icon
      }
    case 'InstantGameUpdateExtensibleMessageAdminText':
      return {
        gameID: (event.game) ? event.game.id : null,
        update_type: event.update_type,
        collapsed_text: event.collapsed_text,
        expanded_text: event.expanded_text,
        instant_game_update_data: event.instant_game_update_data
      }
    case 'GameScoreExtensibleMessageAdminText':
      return {
        game_type: event.game_type
      }
    case 'RtcCallLogExtensibleMessageAdminText':
      return {
        event: event.event,
        is_video_call: event.is_video_call,
        server_info_data: event.server_info_data
      }
    case 'GroupPollExtensibleMessageAdminText':
      return {
        event_type: event.event_type,
        total_count: event.total_count,
        question: event.question
      }
    case 'AcceptPendingThreadExtensibleMessageAdminText':
      return {
        accepter_id: event.accepter_id,
        requester_id: event.requester_id
      }
    case 'ConfirmFriendRequestExtensibleMessageAdminText':
      return {
        friend_request_recipient: event.friend_request_recipient,
        friend_request_sender: event.friend_request_sender
      }
    case 'AddContactExtensibleMessageAdminText':
      return {
        contact_added_id: event.contact_added_id,
        contact_adder_id: event.contact_adder_id
      }
    case 'AdExtensibleMessageAdminText':
      return {
        ad_client_token: event.ad_client_token,
        ad_id: event.ad_id,
        ad_preferences_link: event.ad_preferences_link,
        ad_properties: event.ad_properties
      }
    // never data
    case 'ParticipantJoinedGroupCallExtensibleMessageAdminText':
    case 'ThreadEphemeralTtlModeExtensibleMessageAdminText':
    case 'StartedSharingVideoExtensibleMessageAdminText':
    case 'LightweightEventCreateExtensibleMessageAdminText':
    case 'LightweightEventNotifyExtensibleMessageAdminText':
    case 'LightweightEventNotifyBeforeEventExtensibleMessageAdminText':
    case 'LightweightEventUpdateExtensibleMessageAdminText':
    case 'LightweightEventUpdateTitleExtensibleMessageAdminText':
    case 'LightweightEventUpdateTimeExtensibleMessageAdminText':
    case 'LightweightEventUpdateLocationExtensibleMessageAdminText':
    case 'LightweightEventDeleteExtensibleMessageAdminText':
      return {}
    default:
      console.log(event)
      return console.error('Don\'t know what to with event data type ' + event.__typename)
  }
}

function formatExtensibleAttachment (attachment) {
  if (attachment.story_attachment) {
    return {
      type: 'share',
      description: (attachment.story_attachment.description == null) ? null : attachment.story_attachment.description.text,
      attachmentID: attachment.legacy_attachment_id,
      title: attachment.story_attachment.title_with_entities.text,
      subattachments: attachment.story_attachment.subattachments,
      url: attachment.story_attachment.url,
      source: (attachment.story_attachment.source == null) ? null : attachment.story_attachment.source.text,
      playable: (attachment.story_attachment.media == null) ? null : attachment.story_attachment.media.is_playable,

      // New
      thumbnailUrl: (attachment.story_attachment.media == null) ? null : (attachment.story_attachment.media.animated_image == null && attachment.story_attachment.media.image == null) ? null : (attachment.story_attachment.media.animated_image || attachment.story_attachment.media.image).uri,
      thumbnailWidth: (attachment.story_attachment.media == null) ? null : (attachment.story_attachment.media.animated_image == null && attachment.story_attachment.media.image == null) ? null : (attachment.story_attachment.media.animated_image || attachment.story_attachment.media.image).width,
      thumbnailHeight: (attachment.story_attachment.media == null) ? null : (attachment.story_attachment.media.animated_image == null && attachment.story_attachment.media.image == null) ? null : (attachment.story_attachment.media.animated_image || attachment.story_attachment.media.image).height,
      duration: (attachment.story_attachment.media == null) ? null : attachment.story_attachment.media.playable_duration_in_ms,
      playableUrl: (attachment.story_attachment.media == null) ? null : attachment.story_attachment.media.playable_url,

      // Format example:
      //
      //   [{
      //     key: "width",
      //     value: { text: "1280" }
      //   }]
      //
      // That we turn into:
      //
      //   {
      //     width: "1280"
      //   }
      //
      properties: attachment.story_attachment.properties.reduce(function (obj, cur) {
        obj[cur.key] = cur.value.text
        return obj
      }, {})
    }
  } else {
    return console.error('Don\'t know what to do with extensible_attachment.')
  }
}

function formatReactionsGraphQL (reaction) {
  return {
    reaction: reaction.reaction,
    userID: reaction.user.id
  }
}

function formatMessagesGraphQLResponse (messageThread) {
  const threadID = messageThread.thread_key.thread_fbid ? messageThread.thread_key.thread_fbid : messageThread.thread_key.other_user_id

  const messages = messageThread.messages.nodes.map(function (d) {
    switch (d.__typename) {
      case 'UserMessage': {
        // Give priority to stickers. They're seen as normal messages but we've
        // been considering them as attachments.
        let maybeStickerAttachment
        if (d.sticker) {
          maybeStickerAttachment = [{
            caption: d.snippet, // Not sure what the heck caption was.
            description: d.sticker.label, // Not sure about this one either.
            frameCount: d.sticker.frame_count,
            frameRate: d.sticker.frame_rate,
            framesPerCol: d.sticker.frames_per_col,
            framesPerRow: d.sticker.frames_per_row,
            packID: d.sticker.pack.id,
            spriteURI2x: d.sticker.sprite_image_2x,
            spriteURI: d.sticker.sprite_image,
            stickerID: d.sticker.id,
            url: d.sticker.url, // Oh yeah thanks, sometimes it's URI sometimes it's URL.
            height: d.sticker.height,
            width: d.sticker.width,
            type: 'sticker'
          }]
        }

        return {
          type: 'message',
          attachments: maybeStickerAttachment || ((d.blob_attachments && d.blob_attachments.length > 0) ? _compact(d.blob_attachments.map(formatAttachmentsGraphQLResponse))
            : (d.extensible_attachment) ? _compact(formatExtensibleAttachment(d.extensible_attachment))
              : []),
          body: d.message.text,
          // threadType: messageThread.thread_type,
          messageID: d.message_id,
          senderID: d.message_sender.id,
          // threadID: threadID,

          // New
          messageReactions: d.message_reactions ? _compact(d.message_reactions.map(formatReactionsGraphQL)) : null,
          isSponsered: d.is_sponsored,
          snippet: d.snippet,
          timestamp: d.timestamp_precise
        }
      }
      case 'ThreadNameMessage':
        return {
          type: 'event',
          messageID: d.message_id,
          // threadID: threadID,
          // Can be either "GROUP" or ONE_TO_ONE.
          // threadType: messageThread.thread_type,
          senderID: d.message_sender.id,
          timestamp: d.timestamp_precise,
          eventType: 'change_thread_name',
          snippet: d.snippet,
          eventData: {
            threadName: d.thread_name
          }
        }
      case 'ThreadImageMessage':
        return {
          type: 'event',
          messageID: d.message_id,
          threadID: threadID,
          // Can be either "GROUP" or ONE_TO_ONE.
          // threadType: messageThread.thread_type,
          senderID: d.message_sender.id,
          timestamp: d.timestamp_precise,
          eventType: 'change_thread_image',
          snippet: d.snippet,
          eventData: (d.image_with_metadata == null) ? {} /* removed image */ : { /* image added */
            threadImage: {
              attachmentID: d.image_with_metadata.legacy_attachment_id,
              height: d.image_with_metadata.original_dimensions.x,
              width: d.image_with_metadata.original_dimensions.y,
              url: d.image_with_metadata.preview.uri
            }
          }
        }
      case 'ParticipantLeftMessage':
        return {
          type: 'event',
          messageID: d.message_id,
          threadID: threadID,
          // Can be either "GROUP" or ONE_TO_ONE.
          // threadType: messageThread.thread_type,
          senderID: d.message_sender.id,
          timestamp: d.timestamp_precise,
          eventType: 'remove_participants',
          snippet: d.snippet,
          eventData: {
            // Array of IDs.
            participantsRemoved: d.participants_removed.map(function (p) { return p.id })
          }
        }
      case 'ParticipantsAddedMessage':
        return {
          type: 'event',
          messageID: d.message_id,
          threadID: threadID,
          // Can be either "GROUP" or ONE_TO_ONE.
          // threadType: messageThread.thread_type,
          senderID: d.message_sender.id,
          timestamp: d.timestamp_precise,
          eventType: 'add_participants',
          snippet: d.snippet,
          eventData: {
            // Array of IDs.
            participantsAdded: d.participants_added.map(function (p) { return p.id })
          }
        }
      case 'VideoCallMessage':
        return {
          type: 'event',
          messageID: d.message_id,
          threadID: threadID,
          // Can be either "GROUP" or ONE_TO_ONE.
          // threadType: messageThread.thread_type,
          senderID: d.message_sender.id,
          timestamp: d.timestamp_precise,
          eventType: 'video_call',
          snippet: d.snippet
        }
      case 'VoiceCallMessage':
        return {
          type: 'event',
          messageID: d.message_id,
          threadID: threadID,
          // Can be either "GROUP" or ONE_TO_ONE.
          // threadType: messageThread.thread_type,
          senderID: d.message_sender.id,
          timestamp: d.timestamp_precise,
          eventType: 'voice_call',
          snippet: d.snippet
        }
      case 'GenericAdminTextMessage':
        return {
          type: 'event',
          messageID: d.message_id,
          threadID: threadID,
          // Can be either "GROUP" or ONE_TO_ONE.
          // threadType: messageThread.thread_type,
          senderID: d.message_sender.id,
          timestamp: d.timestamp_precise,
          snippet: d.snippet,
          eventType: d.extensible_message_admin_text_type.toLowerCase(),
          eventData: (d.extensible_message_admin_text) ? formatEventData(d.extensible_message_admin_text) : null
        }
      default:
        console.log(d)
        return console.error('Don\'t know about message type ' + d.__typename)
    }
  })
  return messages
}
// End shamely copy.

async function fetchThreadDetail ({ jar, senderID, messageCount, messageLimit = 7500, before = null }) {
  const messageThread = await handleFetch({ jar, senderID, messageCount, messageLimit, before })
    .then(async (json) => {
      const messageThread = json.o0.data.message_thread
      if (!messageThread.messages.page_info) {
        throw new Error('No page_info.')
      }
      return messageThread
    })
    .catch((err) => {
      console.error(err)
      messageLimit = messageLimit / 2
      if (messageLimit > 1000) {
        return handleFetch({
          jar, senderID, messageCount, messageLimit, before
        })
      } else { throw new Error('Too many error on fetch.') }
    })

  const messages = _compact(formatMessagesGraphQLResponse(messageThread))
  messageCount = messageCount - messages.length
  if (messageThread.messages.page_info.has_previous_page && messages[0] && messageCount) {
    return (await fetchThreadDetail({
      jar,
      senderID,
      messageCount,
      messageLimit,
      before: messages[0].timestamp
    })).concat(messages)
  } else {
    return messages
  }
}

export default async function (args) {
  const { thread, messageLimit, before, jar } = args

  // Copy thread and use it in fetch handler.
  const senderID = thread.id
  const messageCount = (messageLimit) ? Math.min(thread.messageCount, messageLimit) : thread.messageCount
  // Fetch thread detail information.
  return fetchThreadDetail({
    jar, senderID, messageCount, messageLimit, before
  })
}
