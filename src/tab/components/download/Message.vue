<template>
  <div :class="['outer', align]">
    <div :id="messageData.timestamp" :class="[boxAlign]" :title="getSenderName(messageData.senderID)" :time="localTimeString">
      {{ (messageData.body) ? messageData.body : '' }}
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
  </div>
</template>
<script>
const __ = chrome.i18n.getMessage

export default {
  name: 'Message',
  props: [ 'messageData', 'participants', 'selfId' ],
  data: () => ({
    align: 'right' || 'left',
    boxAlign: 'box_r' || 'box_l',
    localTimeString: ''
  }),
  created () {
    const date = new Date(Number(this.messageData.timestamp))
    this.localTimeString = date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
    this.align = (Number(this.messageData.senderID) === Number(this.selfId)) ? 'right' : 'left'
    this.boxAlign = (Number(this.messageData.senderID) === Number(this.selfId)) ? 'box_r' : 'box_l'
  },
  methods: {
    getSenderName (id) {
      const participant = this.participants.find((participant) => participant.user.id === id)
      return (participant) ? participant.user.name : __('unknown')
    }
  }
}
</script>
