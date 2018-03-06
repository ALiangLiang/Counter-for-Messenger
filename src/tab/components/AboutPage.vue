<template>
  <div id="about">
    <h1>Support</h1>
    <h3>Found a bug? Got a question or new idea?</h3>
    <p>Why don't you send us a <a :href="webstorePageUrl + '/support'" target="_blank">report</a>?</p>
    <h3>Like this extension?</h3>
    <p>Let us know on <a :href="webstorePageUrl + '/reviews'" target="_blank">Chrome web store</a>!</p>
    <h3>Want to add feature or help translating?</h3>
    <p>Why not fork in <a href="https://github.com/ALiangLiang/Counter-for-Messenger" target="_blank">Github</a>? 😄</p>

    <h1>Frequently Asked Questions</h1>
    <h3>Is my information safe?</h3>
    <p>
      This extension only fetches your data from Messenger to your local device.
      If your device is not public, your information is safe. On the other hand,
      if you're using a public device, be sure to remove this extension
      after you finish using this extension.
    </p>
    <h3>How can I help Counter of Messenger?</h3>
    <p>
      You can donate to support our work. You can tell others to try
      Counter of Messenger. And, if you're technically-savvy, you can
      <a href="https://chrome.google.com/webstore/detail/flkejcheidpcclcdokndihmnlejfabil" target="_blank">
        use our beta version
      </a>
      and help us find bugs before they're released to the public.
    </p>

    </p>

    <h1>Note</h1>
    <p>
      It'a web extension you know. Inspired by the fact that I want to know
      how many messages I have with my best friends.
      In the beginning it was just a little project. Very simple and ugly.
      But recently, more and more users installed this extension,
      and encouraged me to develop it further. I don't want to disappoint them.
      So I've updated this project, Making it more powerful and beautiful.
      If you really like this extension, tell me. I would very happy.
      😄😄😄 Thanks everyone.
    </p>
  </div>
</template>
<script>
const __ = chrome.i18n.getMessage

export default {
  name: 'About',
  data: () => ({
    webstorePageUrl: 'https://chrome.google.com/webstore/detail/' + __('@@extension_id')
  })
}
</script>

<style scoped>
#about {
  text-align: center;
  max-width: 768px;
  margin: 0 auto;
}
#about h1 {
  font-size: 35px;
}
#about h3 {
  font-size: 25px;
}
#about p {
  font-size: 15px;
  color: #747474;
}
#about h1, h2, h3, h4 {
  font-weight: normal;
}
</style>
