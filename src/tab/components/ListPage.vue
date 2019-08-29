<template>
  <div class="page">
    <thread-list
      ref="threadList"
      v-model="ctx.threads"
      :page="page"
      :ctx="ctx">
    </thread-list>
  </div>
</template>

<script>
import ThreadList from './ThreadList'

export default {
  name: 'ListPage',

  props: ['ctx'],

  components: { ThreadList },

  data () {
    return {
      page: 1
    }
  },

  methods: {}
}
</script>

<style>
.el-table__expand-icon>.el-icon-arrow-right:before {
  color: #f03c24;
  font-size: 16px;
}
</style>

<style scoped>
.page {
  min-width: 1080px;
  max-width: 70%;
  margin: auto;
}
</style>
