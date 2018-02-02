import Vue from 'vue'
import Router from 'vue-router'
import Index from '../components/Index'
import TotalMessages from '../components/TotalMessages'
import TotalText from '../components/TotalText'

Vue.use(Router)

export default new Router({
  routes: [ {
    path: '/',
    name: 'Index',
    component: Index
  }, {
    path: '/message',
    name: 'TotalMessages',
    component: TotalMessages
  }, {
    path: '/text',
    name: 'TotalText',
    component: TotalText
  } ]
})
