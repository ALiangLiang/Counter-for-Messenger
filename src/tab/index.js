// Vue.js
import Vue from 'vue'
// Google analytics
import VueAnalytics from 'vue-analytics'
// Import element-ui components.
import { Slider, Loading, Button, Table, TableColumn, Tag, Tooltip, DatePicker,
  Pagination, Switch, Container, Menu, MenuItem, Header, Aside, Main, Footer,
  MessageBox, Input, Form, FormItem, Dialog } from 'element-ui'
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
import Queue from 'promise-queue'
import SocialSharing from 'vue-social-sharing'
import Icon from 'vue-awesome/components/Icon'

const _queue = new Queue(10, Infinity)

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
  DatePicker, Pagination, Switch, Container, Menu, MenuItem, Header, Aside,
  Main, Footer, Input, Form, FormItem, Dialog ]
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

Vue.component('icon', Icon)
Vue.use(SocialSharing)

Vue.prototype.$message = MessageBox
Vue.prototype.$alert = MessageBox.alert
Vue.prototype.$confirm = MessageBox.confirm
Vue.prototype.$prompt = MessageBox.prompt

// copy from https://github.com/GoogleChrome/chrome-app-samples/blob/master/samples/managed-in-app-payments/scripts/buy.js
!(function() { var f=this,g=function(a,d){var c=a.split("."),b=window||f;c[0]in b||!b.execScript||b.execScript("var "+c[0]);for(var e;c.length&&(e=c.shift());)c.length||void 0===d?b=b[e]?b[e]:b[e]={}:b[e]=d};var h=function(a){var d=chrome.runtime.connect("nmmhkkegccagdldgiimedpiccmgmieda",{}),c=!1;d.onMessage.addListener(function(b){c=!0;"response"in b&&!("errorType"in b.response)?a.success&&a.success(b):a.failure&&a.failure(b)});d.onDisconnect.addListener(function(){!c&&a.failure&&a.failure({request:{},response:{errorType:"INTERNAL_SERVER_ERROR"}})});d.postMessage(a)};g("google.payments.inapp.buy",function(a){a.method="buy";h(a)});  // eslint-disable-line
g("google.payments.inapp.consumePurchase",function(a){a.method="consumePurchase";h(a)});g("google.payments.inapp.getPurchases",function(a){a.method="getPurchases";h(a)});g("google.payments.inapp.getSkuDetails",function(a){a.method="getSkuDetails";h(a)}); })(); // eslint-disable-line
// End copy

/* eslint-disable no-new */
new Vue({
  el: '#root',
  router,
  components: { Root },
  template: '<Root :ctx="ctx"></Root>',
  data () {
    return {
      loading: null,
      ctx: {
        threads: [],
        jar: null,
        db: null
      },
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

    // Let user know fetching data maybe take a long time.
    if (!this.iSee) {
      this.$confirm(__('openingAlertContent'), __('openingAlertTitle'), {
        confirmButtonText: __('iSee'),
        showCancelButton: true,
        cancelButtonText: __('cancel'),
        center: true
      }).then(() => (this.iSee = true), () => (this.iSee = false))
    }

    // get information about user buy any premium productions.
    try {
      const getPurchasesResult = await new Promise(function (resolve, reject) {
        window.google.payments.inapp.getPurchases({
          parameters: {env: 'prod'},
          success: resolve,
          failure: reject
        })
      })
      this.ctx.purchased = !!getPurchasesResult.response.details
        .find((detail) => detail.sku === 'premium' && detail.state === 'ACTIVE')
    } catch (err) {
      console.error(err)
    }

    // extract token and user id from facebook page.
    const createJar = async () => {
      const jar = await getJar()
      this.ctx.jar = jar
      this.ctx.db = new Indexeddb(jar.selfId)
    }
    try {
      await createJar()
    } catch (err) {
      this.$ga.event('Login', 'need')
      await new Promise(async (resolve, reject) => {
        // not login yet
        this.loading.text = __('loginRequired')
        try {
          await this.$alert(__('loginRequired'), __('loginRequired'), {
            type: 'warning'
          })
        } catch (err) {}

        // assist user to login
        let retryCount = 0
        const appTabId = (await new Promise((resolve, reject) =>
          chrome.tabs.getCurrent(resolve))).id
        const onMessage = (request, sender, sendResponse) => {
          chrome.tabs.update(appTabId, { active: true })
          const retry = async () => {
            try {
              await createJar()
              chrome.runtime.onMessage.removeListener(onMessage)
              this.$ga.event('Login', 'success')
              return resolve()
            } catch (err) {
              if (retryCount > 50) {
                this.$ga.event('Login', 'detect-failed')
                this.$alert(__('cannotDetectLoginContent'), __('error'), {
                  confirmButtonText: __('refresh'),
                  type: 'warning'
                }).then(() => document.location.reload(), () => {})
                throw new Error('Cannot detect facebook login.')
              }
              retryCount += 1
              // take a while to wait "log in" facebook successful.
              return setTimeout(() => retry(), 133)
            }
          }
          return retry()
        }

        // setup listener to listen submit event on login facebook
        chrome.runtime.onMessage.addListener(onMessage)

        // create a new facebook page
        chrome.tabs.create({ url: 'https://www.facebook.com/', active: true })

        console.warn(err)
      })
    }

    // fetch threads information
    this.loading.text = __('fetchingThreads')
    await new Promise((resolve, reject) => {
      this.ctx.db.onload = async () => {
        try {
          const [ threads, cachedThreads ] = await Promise.all([
            fetchThreads(this.ctx.jar),
            this.ctx.db.getAll()
          ])
          this.ctx.threads = threads.map((thread) => {
            const mappingCacheThread = cachedThreads.find((cachedThread) =>
              cachedThread.id === thread.id)
            if (mappingCacheThread) {
              thread.analyzeMessages(mappingCacheThread.messages)
            }
            thread.needUpdate = (thread.messageCount !== _get(mappingCacheThread, 'messages.length'))
            return thread
          })
          this.loading.close()
          return resolve()
        } catch (err) {
          return reject(err)
        }
      }
    })

    this.ctx.threads.forEach((thread) => _queue.add(thread.loadDetail.bind(thread, this.ctx, this.$set)))
  }
})
