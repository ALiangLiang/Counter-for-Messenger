import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale'
import Root from './Root.vue'
import router from './router'
import fetchThreadsMessageCount from './fetchThreadsMessageCount.js'

Vue.config.productionTip = false

Vue.use(ElementUI, { locale })

/* eslint-disable no-new */
new Vue({
  el: '#root',
  router,
  components: { Root },
  template: '<Root :threads-info="threadsInfo"></Root>',
  data: () => ({
    loading: null,
    threadsInfo: []
  }),
  created () {
    this.loading = this.$loading({
      lock: true,
      text: '抓取訊息總數中...',
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    fetchThreadsMessageCount()
      .then((infos) => {
        this.threadsInfo = infos
        this.loading.close()
      })
  }
})
