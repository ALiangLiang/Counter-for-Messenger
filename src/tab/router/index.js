import Vue from 'vue'
import Router from 'vue-router'
import About from '../components/About'
import Index from '../components/Index'
import TotalMessages from '../components/TotalMessages'
import TotalText from '../components/TotalText'

Vue.use(Router)

/* eslint-disable no-multi-spaces */
export default new Router({
  routes: [
    { path: '/about',   name: 'About',         component: About },
    { path: '/',        name: 'Index',         component: Index },
    { path: '/message', name: 'TotalMessages', component: TotalMessages },
    { path: '/text',    name: 'TotalText',     component: TotalText }
  ]
})
