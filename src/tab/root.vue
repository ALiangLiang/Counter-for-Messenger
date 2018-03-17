<template>
  <el-container id="root">
    <el-header>
      <el-menu
        router
        class="navbar"
        mode="horizontal"
        background-color="#0083FF"
        text-color="#f1f1f1"
        default-active="/list"
        active-text-color="#ffffff">
        <el-menu-item index="/about">
          <img src="../../static/icons/38.png"></img>
          <span> {{ __('extName') }}</span>
        </el-menu-item>
        <el-menu-item index="/list">{{ __('listPage') }}</el-menu-item>
        <el-menu-item index="/chart">{{ __('chartPage') }}</el-menu-item>
        <el-menu-item index="">
          <social-sharing url="https://chrome.google.com/webstore/detail/ldlagicdigidgnhniajpmoddkoakdoca"
            network-tag="div"
            inline-template>
            <network network="weibo">
              <icon name="share-alt"></icon>
              Weibo
              <icon name="weibo" label="Share on Weibo"></icon>
            </network>
          </social-sharing>
        </el-menu-item>
        <el-menu-item index="">
          <social-sharing url="https://chrome.google.com/webstore/detail/ldlagicdigidgnhniajpmoddkoakdoca"
            network-tag="div"
            inline-template>
            <network network="reddit">
              <icon name="share-alt"></icon>
              Reddit
              <icon name="reddit-square" label="Share on Reddit"></icon>
            </network>
          </social-sharing>
        </el-menu-item>
        <el-menu-item index="">
          <social-sharing url="https://chrome.google.com/webstore/detail/ldlagicdigidgnhniajpmoddkoakdoca"
            network-tag="div"
            inline-template>
            <network network="twitter">
              <icon name="share-alt"></icon>
              Twitter
              <icon name="twitter-square" label="Share on Twitter"></icon>
            </network>
          </social-sharing>
        </el-menu-item>
        <el-menu-item index="">
          <social-sharing url="https://chrome.google.com/webstore/detail/ldlagicdigidgnhniajpmoddkoakdoca"
            network-tag="div"
            inline-template>
            <network network="facebook">
              <icon name="share-alt"></icon>
              Facebook
              <icon name="facebook-square" label="Share on Facebook"></icon>
            </network>
          </social-sharing>
        </el-menu-item>
      </el-menu>
    </el-header>
    <el-main>
      <transition name="fade">
        <router-view :ctx="ctx"/>
      </transition>
    </el-main>
    <el-footer height="30px" class="offset-footer"></el-footer>
    <el-footer height="30px">
      <a href="https://github.com/ALiangLiang/Counter-for-Messenger" target="_blank">
        <icon name="github"></icon> Github
      </a>
      <a href="https://github.com/ALiangLiang" target="_blank">
        <icon name="user"></icon> Author: ALiangLiang
      </a>
      <a href="https://www.paypal.me/ALiangLiang/3" target="_blank">
        <icon name="paypal"></icon> Donate: Paypel
      </a>
      <a href="https://www.buymeacoffee.com/ALiangLiang" target="_blank">
        <icon name="coffee"></icon> Donate: Buy me a coffee
      </a>
    </el-footer>
  </el-container>
</template>

<script>
import 'vue-awesome/icons/share-alt'
import 'vue-awesome/icons/facebook-square'
import 'vue-awesome/icons/reddit-square'
import 'vue-awesome/icons/twitter-square'
import 'vue-awesome/icons/weibo'
import 'vue-awesome/icons/github'
import 'vue-awesome/icons/user'
import 'vue-awesome/icons/coffee'
import 'vue-awesome/icons/paypal'

(function (d, s, id) {
  var js
  var fjs = d.getElementsByTagName(s)[0]
  if (d.getElementById(id)) return
  js = d.createElement(s); js.id = id
  js.src = 'https://connect.facebook.net/zh_TW/sdk.js#xfbml=1&version=v2.12&appId=168178573969360&autoLogAppEvents=1'
  fjs.parentNode.insertBefore(js, fjs)
}(document, 'script', 'facebook-jssdk'))

export default {
  name: 'Root',

  props: [ 'ctx' ]
}
</script>

<style>
body {
  margin: 0;
}
.el-main {
  padding-left: 0;
  padding-right: 0;
}
.el-header {
  padding: 0;
}
.el-header>ul>li:first-of-type {
  margin-left: 50px;
}
.el-footer {
  position: fixed;
  width: 100%;
  bottom: 0;
  text-align: center;
  background-color: #272727;
  color: white;
  padding-top: 5px;
  z-index: 1;
}
.el-footer.offset-footer {
  background-color: white;
  position: relative;
}
.el-footer a {
  color: white;
  text-decoration: none;
}
.el-footer a>svg {
  /*keeping some space on the bottom bar*/
  padding-right:5px;
  padding-left:10px;
}
.el-footer {
  /*making the footer visually more even*/
  height:32px !important;
}
.share-link {
  text-decoration: none;
}
.share-link>.fa-icon {
  padding-bottom: 5px;
}
.navbar>li:nth-last-child(-n+4) {
  float: right;
}
</style>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition-property: opacity;
  transition-duration: .05s;
}
.fade-enter-active {
  transition-delay: .1s;
}
.fade-enter, .fade-leave-active {
  opacity: 0
}
.title {
  text-align:center;
  color: #58636B;
  font-size:15px;
  padding-bottom: 13px;
  border-bottom: 1px solid rgba(0, 0, 0, .10);
}
.outer {
  background: #FFFCDD;
  word-break: break-all;
  max-width: 70%;
   background: #FFFBD4;
  padding: 0.6em 1.2em;
  border-radius: 12px;
  margin: 11px;
  clear: both;
  float: left;
  color: #58636B;
  box-shadow: 0 1px 3px -1px rgba(0, 0, 0, 0.09);
  position: relative;
}
.outer:hover {
  background: #FFF8B5;
}
.outer.right {
  float: right;
  background: #BDFFCB;
  background: #E6E5DF;
}
.outer.right:hover {
  background: #D6D5CB;
}
.outer > div:after {
  content: attr(title);
  position: absolute;
  bottom: -1.5em;
  left: 1em;
  font-size: 0.8em;
  color: #5C6D86;
  display: block;
  width: 15em;
  opacity: 0;
  transition: 0.2s all;
  transform: translateY(-3px);
  visibility: hidden;
}
.outer.right > div:after{
  left: initial;
  right: 1em;
  text-align: right;
}
.outer:hover > div:after {
  opacity: 1;
  transform: translateY(0);
  visibility: visible;
}
#define {
  text-align:center;
}
</style>
