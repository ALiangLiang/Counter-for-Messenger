<template>
  <div id="container" class='container'>
    <div class="title"></div>
    <div v-for="(message, i) in messagesData" :key="i">
      <message
        v-if="message.type === 'message'"
        :message-data="message"
        :participants="participants"
        :self-id="selfId">
      </message>
      <event
        v-if="message.type === 'event'"
        :message-data="message">
      </event>
    </div>
  </div>
</template>
<script>
import MessageElement from './Message.vue'
import EventElement from './Event.vue'

export default {
  name: 'Thread',
  components: { Message: MessageElement, Event: EventElement },
  props: [ 'messagesData', 'participants', 'selfId' ]
}
</script>
