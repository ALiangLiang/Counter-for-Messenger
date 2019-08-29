<template>
  <div class="clearfix">
    <img
      v-if="!isSelf"
      :alt="senderName"
      :src="senderAvatar"
      height="32"
      width="32"
      class="avatar">
    <div :class="['outer', align]">
      <div
        :id="messageData.timestamp"
        :class="[boxAlign]"
        :title="senderName"
        :time="localTimeString">
        <span class="message-text">{{ (messageData.body) ? messageData.body : '' }}</span>
        <div v-for="(attachment, i) in messageData.attachments" :key="i">
          <img v-if="attachment.type === 'sticker'" :src="attachment.url" class="sticker-img">
          <img v-if="attachment.type === 'image'" :src="attachment.previewUrl" class="image-img">
          <audio
            v-if="attachment.type === 'audio'"
            :src="attachment.url"
            controls>
            Your browser does not support the <code>audio</code> element.
          </audio>
          <video
            v-if="attachment.type === 'video'"
            :src="attachment.url"
            controls>
            Your browser does not support the <code>video</code> element.
          </video>
          <a
            v-if="attachment.type === 'file'"
            :href="attachment.url"
            target="_blank">
            💾 {{ attachment.filename }}
          </a>
        </div>
      </div>
      <div v-if="reactions" class="reaction">
        <span class="reactionEmoji">{{ reactions }}</span>
        <span class="reactionNum">{{ this.messageData.messageReactions.length }}</span>
      </div>
    </div>
  </div>
</template>
<script>
import _union from 'lodash/union'
const __ = chrome.i18n.getMessage

export default {
  name: 'Message',
  props: ['messageData', 'participants', 'selfId'],
  data: () => ({
    align: 'right' || 'left',
    boxAlign: 'box_r' || 'box_l',
    localTimeString: '',
    reactions: null
  }),
  created () {
    const date = new Date(Number(this.messageData.timestamp))
    this.localTimeString = date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
    this.isSelf = Number(this.messageData.senderID) === Number(this.selfId)
    this.align = (this.isSelf) ? 'right' : 'left'
    this.boxAlign = (this.isSelf) ? 'box_r' : 'box_l'
    if (this.messageData.messageReactions && this.messageData.messageReactions.length) {
      // const reactions = this.messageData.messageReactions.map((messageReaction) => ({
      //   name: this.getParticipant(messageReaction.id),
      //   reaction: messageReaction.reaction
      // }))
      this.reactions = _union(this.messageData.messageReactions
        .map((messageReaction) => messageReaction.reaction))
        .join('')
    }
  },
  computed: {
    sender () { return this.getParticipant(this.messageData.senderID) },
    senderName () { return (this.sender) ? this.sender.user.name : __('unknown') },
    senderAvatar () { return (this.sender) ? this.sender.user.avatar : null }
  },
  methods: {
    getParticipant (id) {
      return this.participants.find((participant) => participant.user.id === id)
    }
  }
}
</script>
