<template>
  <el-container id="root">
    <el-header>
      <el-menu
        router
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
          <a class="share-link" target="_blank"
            href="https://www.facebook.com/sharer/sharer.php?u=https%3A//chrome.google.com/webstore/detail/ldlagicdigidgnhniajpmoddkoakdoca">
            <icon name="facebook-square" scale="2" label="Share on Facebook"></icon> {{ __('shareOnFacebook') }}
          </a>
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
    </el-footer>
    <div id="fb-root"></div>
  </el-container>
</template>

<script>
import 'vue-awesome/icons/facebook-square'
import 'vue-awesome/icons/github'
import 'vue-awesome/icons/user'
import Icon from 'vue-awesome/components/Icon'

export default {
  name: 'Root',
  props: [ 'ctx' ],
  components: {
    Icon
  }
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
.el-menu>li:last-child {
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
