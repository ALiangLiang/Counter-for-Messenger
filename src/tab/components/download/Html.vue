<template>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
      <title>{{ title }}</title>
      <link rel="stylesheet" type="text/css" href="download.css">
    </head>
    <body>
      <thread
        :messages-data="messagesData"
        :participants="participants"
        :self-id="selfId"></thread>
    </body>
  </html>
</template>
<script>
import ThreadComponenet from './Thread.vue'

export default {
  name: 'Html',
  components: { Thread: ThreadComponenet },
  props: ['title', 'messagesData', 'participants', 'selfId']
}
</script>
