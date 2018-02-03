import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale'
import Root from './Root.vue'
import router from './router'
import fetchThreadsMessageCount from './lib/fetchThreadsMessageCount.js'
import getToken from './lib/getToken.js'

const __ = chrome.i18n.getMessage
Vue.prototype.__ = chrome.i18n.getMessage

Vue.config.productionTip = false

Vue.use(ElementUI, { locale })

/* eslint-disable no-new */
new Vue({
  el: '#root',
  router,
  components: { Root },
  template: '<Root :threads-info="threadsInfo" :token="token" :self-id="selfId"></Root>',
  data () {
    let iSee = false
    try {
      iSee = JSON.parse(window.localStorage.getItem('iSee'))
      if (typeof (iSee) !== 'boolean') throw new Error('Variable "iSee" is not type Boolean.')
    } catch (err) {
      console.error(err)
      iSee = false
      window.localStorage.setItem('iSee', iSee)
    }
    return {
      loading: null,
      threadsInfo: [],
      token: null,
      selfId: null,
      iSee
    }
  },
  watch: {
    iSee (value) {
      window.localStorage.setItem('iSee', value)
    }
  },
  async created () {
    this.loading = this.$loading({
      lock: true,
      text: this.__('interceptingToken'),
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.7)'
    })

    if (!this.iSee) {
      this.$confirm(__('openingAlertContent'), __('openingAlertTitle'), {
        confirmButtonText: __('iSee'),
        showCancelButton: true,
        cancelButtonText: __('cancel'),
        center: true
      }).then(() => (this.iSee = true), () => (this.iSee = false))
    }

    const { token, selfId } = await getToken()
    this.token = token
    this.selfId = selfId
    this.loading.text = __('fetchingThreads')
    this.threadsInfo = await fetchThreadsMessageCount(this.token)
    this.loading.close()
  }
})
