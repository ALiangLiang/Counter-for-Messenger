<template>
  <div :class="['outer', align]">
    <div :id="messageData.timestamp" :class="[boxAlign]" :title="localTimeString">
      {{ (messageData.text) ? messageData.text : '' }}
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
    this.align = (Number(this.messageData.senderId) === Number(this.selfId)) ? 'right' : 'left'
    this.boxAlign = (Number(this.messageData.senderId) === Number(this.selfId)) ? 'box_r' : 'box_l'
  }
}
</script>
