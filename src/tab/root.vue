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
        <el-menu-item index="">
          <img src="../../static/icons/38.png"></img>
          <span> {{ __('extName') }}</span>
        </el-menu-item>
        <el-menu-item index="/">{{ __('indexPage') }}</el-menu-item>
        <el-menu-item index="/message">{{ __('messageChart') }}</el-menu-item>
        <el-menu-item index="/text">{{ __('textChart') }}</el-menu-item>
      </el-menu>
    </el-header>
    <el-main>
      <router-view :threadsInfo="threadsInfo" :token="token" :self-id="selfId" :db="db"/>
    </el-main>
    <el-footer>
      <ul>
        <li>
          <a href="https://github.com/ALiangLiang/Counter-for-Messenger">
            <icon name="github"></icon> Github
          </a>
        </li>
        <li>
          <a href="https://github.com/ALiangLiang">
            <icon name="user"></icon> Author: ALiangLiang
          </a>
        </li>
      </ul>
    </el-footer>
  </el-container>
</template>
<script>
import 'vue-awesome/icons/github'
import 'vue-awesome/icons/user'
import Icon from 'vue-awesome/components/Icon'

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
}
.el-footer a {
  color: white;
}
.el-footer ul {
  padding-left: 0;
  list-style-type: none;
}
</style>
