<template>
  <el-container id="root">
    <el-header>
      <el-menu
        router
        mode="horizontal"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b">
        <el-menu-item index="/">首頁</el-menu-item>
        <el-menu-item index="/message">訊息量</el-menu-item>
        <el-menu-item index="/text">字數量</el-menu-item>
      </el-menu>
    </el-header>
    <el-main>
      <router-view :threadsInfo="threadsInfo"/>
    </el-main>
  </el-container>
</template>
<script>
export default {
  name: 'Root',
  props: ['threadsInfo'],
  created () { console.log(this.threadsInfo) },
  watch: {
    threadsInfo () { console.log(this.threadsInfo) }
  }
}
</script>
<style scoped>
</style>
