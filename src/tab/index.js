import Vue from 'vue'
import VueAnalytics from 'vue-analytics'
// Import element-ui components.
import { Slider, Loading, Button, Table, TableColumn, Tag, Tooltip,
  Pagination, Switch, Container, Menu, MenuItem, Header, Aside, Main, Footer,
  MessageBox, Input, Form, FormItem } from 'element-ui'
// Customize element-ui theme. Let this style more like FB.
import '../../element-variables.scss'
/**
 * Languages of Element-UI
 * Base on locales of this extension.
 */
import enLocale from 'element-ui/lib/locale/lang/en'
import zhLocale from 'element-ui/lib/locale/lang/zh-TW'

// Libs
import locale from 'element-ui/lib/locale'
import _get from 'lodash/get'
import Root from './Root.vue'
import router from './router'
import fetchThreads from './lib/fetchThreads.js'
import { getJar } from './lib/util.js'
import Indexeddb from '../ext/Indexeddb.js'
import storage from '../ext/storage.js'

// Alias i18n function.
const __ = chrome.i18n.getMessage
Vue.prototype.__ = __

// Change docuemnt title manually. Coz title is assign on build stage.
document.title = __('extName')

Vue.config.productionTip = false

const mainLangName = chrome.i18n.getUILanguage().split('-')[0]
locale.use((mainLangName === 'zh') ? zhLocale : enLocale)

// Import element-ui components.
const elements = [ Slider, Loading, Button, Table, TableColumn, Tag, Tooltip,
  Pagination, Switch, Container, Menu, MenuItem, Header, Aside, Main, Footer,
  Input, Form, FormItem ]
elements.forEach((el) => Vue.use(el, { locale }))

// In Chrome extension, must close checking protocol.
const gaSet = [{ field: 'checkProtocolTask', value: null }]
if (process.env.NODE_ENV !== 'production') {
  // If not in production mode, don't send any data to ga service.
  gaSet.push({ field: 'sendHitTask', value: null })
}
Vue.use(VueAnalytics, {
  id: (!process.env.BETA) ? 'UA-114347247-1' : 'UA-114347247-3',
  set: gaSet,
  router
})

Vue.prototype.$confirm = MessageBox.confirm

/* eslint-disable no-new */
new Vue({
  el: '#root',
  router,
  components: { Root },
  template: '<Root :threads-info="threadsInfo" :jar="jar" :db="db"></Root>',
  data () {
    return {
      loading: null,
      threadsInfo: [],
      jar: null,
      db: null,
      iSee: storage.get('iSee', false)
    }
  },
  watch: {
    iSee (value) {
      storage.set('iSee', value)
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

    try {
      const jar = await getJar()
      this.jar = jar
      this.db = new Indexeddb(jar.selfId)
    } catch (err) {
      console.error(err)
      throw err
    }

    try {
      this.loading.text = __('fetchingThreads')
      this.db.onload = async () => {
        const [ threads, cachedThreads ] = await Promise.all([
          fetchThreads(this.jar),
          this.db.getAll()
        ])
        this.threadsInfo = threads.map((thread) => {
          const mappingCacheThread = cachedThreads.find((cachedThread) =>
            cachedThread.id === thread.id)
          if (mappingCacheThread) {
            thread.analyzeMessages(mappingCacheThread.messages)
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
