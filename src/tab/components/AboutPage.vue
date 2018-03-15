<template>
  <div id="about">
    <h1>{{ __('support') }}</h1>
    <h3>{{ __('support1Title') }}</h3>
    <p v-html="__('support1Content', [ supportPage ])"></p>
    <h3>{{ __('support2Title') }}</h3>
    <p v-html="__('support2Content', [ reviewPage ])"></p>
    <h3>{{ __('support3Title') }}</h3>
    <p v-html="__('support3Content', [ 'https://github.com/ALiangLiang/Counter-for-Messenger' ])"></p>

    <h1>{{ __('QA') }}</h1>
    <h3>{{ __('QA1Title') }}</h3>
    <p>{{ __('QA1Content') }}</p>
    <h3>{{ __('QA2Title') }}</h3>
    <p v-html="__('QA2Content', [ 'https://www.buymeacoffee.com/ALiangLiang', 'https://chrome.google.com/webstore/detail/flkejcheidpcclcdokndihmnlejfabil' ])"></p>
    <h3>{{ __('QA3Title') }}</h3>
    <p>{{ __('QA3Content') }}</p>

    <h1>{{ __('note') }}</h1>
    <p>{{ __('noteContent') }}</p>
  </div>
</template>
<script>
const __ = chrome.i18n.getMessage

export default {
  name: 'About',
  data: () => ({
    supportPage: (!process.env.FIREFOX) ? `https://chrome.google.com/webstore/detail/${__('@@extension_id')}/support` : 'https://github.com/ALiangLiang/Counter-for-Messenger/issues',
    reviewPage: (!process.env.FIREFOX) ? `https://chrome.google.com/webstore/detail/${__('@@extension_id')}/reviews` : 'https://addons.mozilla.org/firefox/addon/counter-for-messenger/'
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
