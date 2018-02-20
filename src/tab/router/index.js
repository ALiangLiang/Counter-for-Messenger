import Vue from 'vue'
import Router from 'vue-router'
import AboutPage from '../components/AboutPage'
import ListPage from '../components/ListPage'
import ChartPage from '../components/ChartPage'

Vue.use(Router)

/* eslint-disable no-multi-spaces */
export default new Router({
  routes: [
    { path: '/',      redirect: '/list' },
    { path: '/about', name: 'About',     component: AboutPage },
    { path: '/list',  name: 'ListPage',  component: ListPage },
    { path: '/chart', name: 'ChartPage', component: ChartPage }
  ]
})
