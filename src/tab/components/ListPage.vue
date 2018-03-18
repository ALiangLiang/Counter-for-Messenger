<template>
  <div class="page">
    <div style="margin: 20px">
      <el-form :inline="true" @submit.native.prevent>
        <el-form-item :label="__('searchInputLabel') + __('colon')">
          <el-input
            :placeholder="__('searchInputPlaceholder')"
            v-model="keyword"
            :maxlength="120"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchSelectedThreads()">
            {{ __('fetchDetailOfselected') }}
          </el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="danger" @click="reset()">
            {{ __('reset') }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <thread-list
      ref="threadList"
      v-model="ctx.threads"
      :keyword="keyword"
      :page="page"
      :ctx="ctx">
    </thread-list>
  </div>
</template>

<script>
import ThreadList from './ThreadList'
const __ = chrome.i18n.getMessage

export default {
  name: 'ListPage',

  props: [ 'ctx' ],

  components: { ThreadList },

  data () {
    return {
      keyword: '',
      page: 1
    }
  },

  mounted () {
    this.keyword = this.$route.query.keyword || ''
  },

  methods: {
    fetchSelectedThreads () {
      return this.$refs['threadList'].fetchSelectedThreads()
    },
    reset () {
      this.$ga.event('Threads', 'reset')

      return this.$confirm(__('resetConfirmContent'), __('resetConfirmTitle'), {
        confirmButtonText: __('sure'),
        showCancelButton: true,
        cancelButtonText: __('cancel'),
        center: true
      }).then(() => this.ctx.db.destroy(), () => null)
    }
  }
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
