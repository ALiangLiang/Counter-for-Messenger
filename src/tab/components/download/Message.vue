<template>
  <div :class="['outer', align]">
    <div :id="messageData.timestamp" :class="[boxAlign]" :title="localTimeString">
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
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Message',
  props: [ 'messageData', 'selfId' ],
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
  }
}
</script>
