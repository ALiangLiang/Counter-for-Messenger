<template>
  <el-container id="root">
    <el-header>
      <el-menu
        router
        mode="horizontal"
        background-color="#0083FF"
        text-color="#fff"
        default-active="/"
        active-text-color="#ffd04b">
        <el-menu-item index="/about">
          <img src="../../static/icons/38.png"></img>
          <span> {{ __('extName') }}</span>
        </el-menu-item>
        <el-menu-item index="/">{{ __('indexPage') }}</el-menu-item>
        <el-menu-item index="/chart">{{ __('chartPage') }}</el-menu-item>
        <el-menu-item index="">
          <a class="share-link" target="_blank"
            href="https://www.facebook.com/sharer/sharer.php?u=https%3A//chrome.google.com/webstore/detail/ldlagicdigidgnhniajpmoddkoakdoca">
            <icon name="facebook-square" scale="2" label="Share on Facebook"></icon> Share on Facebook
          </a>
        </el-menu-item>
      </el-menu>
    </el-header>
    <el-main>
      <router-view :threadsInfo="threadsInfo" :token="token" :self-id="selfId" :db="db"/>
    </el-main>
    <el-footer height="30px">
      <a href="https://github.com/ALiangLiang/Counter-for-Messenger">
        <icon name="github"></icon> Github
      </a>
      <a href="https://github.com/ALiangLiang">
        <icon name="user"></icon> Author: ALiangLiang
      </a>
    </el-footer>
    <div id="fb-root"></div>
  </el-container>
</template>
<script>
import 'vue-awesome/icons/facebook-square'
import 'vue-awesome/icons/github'
import 'vue-awesome/icons/user'
import Icon from 'vue-awesome/components/Icon'

Icon.register({
  'facebook-messenger': {
    width: 23.868,
    height: 26,
    d: 'M224 32C15.9 32-77.5 278 84.6 400.6V480l75.7-42c142.2 39.8 285.4-59.9 285.4-198.7C445.8 124.8 346.5 32 224 32zm23.4 278.1L190 250.5 79.6 311.6l121.1-128.5 57.4 59.6 110.4-61.1-121.1 128.5z'
  }
})

export default {
  name: 'Root',
  props: [ 'threadsInfo', 'token', 'selfId', 'db' ],
  components: {
    Icon
  }
}
</script>
<style>
body {
  margin: 0;
}
.el-header {
  padding: 0;
}
.el-header>ul>li:first-of-type {
  margin-left: 50px;
}
.el-footer {
  text-align: center;
  background-color: #272727;
  color: white;
  padding-top: 5px;
}
.el-footer a {
  color: white;
  text-decoration: none;
}
.share-link {
  text-decoration: none;
}
.share-link>.fa-icon {
  padding-bottom: 5px;
}
.el-menu>li:last-child {
  float: right;
}
</style>
