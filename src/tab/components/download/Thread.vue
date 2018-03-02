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
        <message
          v-for="(message, i) in messagesData"
          :key="i"
          :message-data="message"
          :self-id="selfId">
        </message>
      </div>
    </body>
  </html>
</template>
<script>
import MessageElement from './Message.vue'

export default {
  name: 'Thread',
  components: { Message: MessageElement },
  props: [ 'messagesData', 'selfId' ]
}
</script>
