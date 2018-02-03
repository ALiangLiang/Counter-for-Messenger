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
        <el-menu-item index="/">{{ __('indexPage') }}</el-menu-item>
        <el-menu-item index="/message">{{ __('messageChart') }}</el-menu-item>
        <el-menu-item index="/text">{{ __('textChart') }}</el-menu-item>
      </el-menu>
    </el-header>
    <el-main>
      <router-view :threadsInfo="threadsInfo" :token="token" :self-id="selfId"/>
    </el-main>
  </el-container>
</template>
<script>
export default {
  name: 'Root',
  props: [ 'threadsInfo', 'token', 'selfId' ]
}
</script>
<style>
body {
  margin: 0;
}
.el-header {
  padding: 0;
}
</style>
