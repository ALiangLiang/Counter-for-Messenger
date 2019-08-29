<template functional>
  <div class="event-outer">
    <span class="event-snippet">
      {{ messageData.snippet }}
    </span>
  </div>
</template>

<script>
export default {
  name: 'Message',
  props: ['messageData', 'selfId'],
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
