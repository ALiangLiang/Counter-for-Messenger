import Vue from 'vue'
import { Form, FormItem, Switch } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import enLocale from 'element-ui/lib/locale/lang/en'
import zhLocale from 'element-ui/lib/locale/lang/zh-TW'
import locale from 'element-ui/lib/locale'
import root from './root.vue'

Vue.config.productionTip = false

const mainLangName = chrome.i18n.getUILanguage().split('-')[0]
locale.use((mainLangName === 'zh') ? zhLocale : enLocale)

Vue.use(Form, { locale })
Vue.use(FormItem, { locale })
Vue.use(Switch, { locale })

/* eslint-disable no-new */
new Vue({
  el: '#root',
  render: h => h(root)
})
