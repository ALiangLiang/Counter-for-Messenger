import Vue from 'vue'
import { Slider, Loading, Message, Button, Table, TableColumn, Tag, Tooltip,
  Pagination, Switch, Container, Header, Menu, MenuItem, Main } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import enLocale from 'element-ui/lib/locale/lang/en'
import zhLocale from 'element-ui/lib/locale/lang/zh-TW'
import locale from 'element-ui/lib/locale'
import _get from 'lodash/get'
import Root from './Root.vue'
import router from './router'
import fetchThreads from './lib/fetchThreads.js'
import getToken from './lib/getToken.js'
import Indexeddb from '../ext/Indexeddb.js'
import Thread from './classes/Thread.js'

const __ = chrome.i18n.getMessage
Vue.prototype.__ = __
document.title = __('extName')

Vue.config.productionTip = false

const mainLangName = chrome.i18n.getUILanguage().split('-')[0]
locale.use((mainLangName === 'zh') ? zhLocale : enLocale)

const elements = [ Slider, Loading, Message, Button, Table, TableColumn, Tag,
  Tooltip, Pagination, Switch, Container, Header, Menu, MenuItem, Main ]
elements.forEach((el) => Vue.use(el, { locale }))

/* eslint-disable no-new */
new Vue({
  el: '#root',
  router,
  components: { Root },
  template: '<Root :threads-info="threadsInfo" :token="token" :self-id="selfId" :db="db"></Root>',
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
      db: null,
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

    /**
     * Create a listener. Use to listen from content script injecting
     * in Messenger login page. If need login, remind client.
     */
    const onNeedLogin = () => (this.loading.text = __('waitingForLogin'))
    chrome.runtime.onMessage.addListener(onNeedLogin)

    try {
      const { token, selfId } = await getToken()
      chrome.runtime.onMessage.removeListener(onNeedLogin) // Remove listener after get token.
      this.token = token
      this.selfId = selfId
      this.db = new Indexeddb(selfId)
    } catch (err) {
      console.error(err)
      this.loading.text = __('messengerIsDead')
      Message({
        type: 'error',
        message: __('messengerIsDead')
      })
      throw err
    }

    try {
      this.loading.text = __('fetchingThreads')
      this.db.onload = async () => {
        const [ threads, cachedThreads ] = await Promise.all([
          fetchThreads(this.token),
          this.db.getAll()
        ])
        this.threadsInfo = threads.map((thread) => {
          const mappingCacheThread = cachedThreads.find((cachedThread) =>
            cachedThread.id === thread.id)
          if (mappingCacheThread) {
            thread.textCount = Thread.culTextCount(mappingCacheThread.messages)
          }
          thread.needUpdate = (thread.messageCount !== _get(mappingCacheThread, 'messages.length'))
          return thread
        })
        this.loading.close()
      }
    } catch (err) {
      console.error(err)
    }
  }
})
