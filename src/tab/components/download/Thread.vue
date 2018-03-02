<template>
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
      <link rel="stylesheet" type="text/css" href="download.css">
    </head>
    <body>
      <div id="container" class='container'>
        <div class="title"></div>
        <div v-for="(message, i) in messagesData" :key="i">
          <message
            v-if="message.type === 'message'"
            :message-data="message"
            :self-id="selfId">
          </message>
          <event
            v-if="message.type === 'event'"
            :message-data="message"
            :self-id="selfId">
          </event>
        </div>
      </div>
    </body>
  </html>
</template>
<script>
import MessageElement from './Message.vue'
import EventElement from './Event.vue'

export default {
  name: 'Thread',
  components: { Message: MessageElement, Event: EventElement },
  props: [ 'messagesData', 'selfId' ]
}
</script>
