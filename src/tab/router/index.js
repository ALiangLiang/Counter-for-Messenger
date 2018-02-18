import Vue from 'vue'
import Router from 'vue-router'
import About from '../components/About'
import Index from '../components/Index'
import ChartPage from '../components/ChartPage'

Vue.use(Router)

/* eslint-disable no-multi-spaces */
export default new Router({
  routes: [
    { path: '/about',   name: 'About',         component: About },
    { path: '/',        name: 'Index',         component: Index },
    { path: '/chart', name: 'ChartPage', component: ChartPage }
  ]
})
