<template>
  <el-table
    :data="threadsInfo"
    :max-height="720"
    show-summary
    :summary-method="getSummaries"
    style="width: 100%">
    <el-table-column
      prop="id"
      sortable
      label="#"
      width="180">
    </el-table-column>
    <el-table-column
      :label="__('threadName')"
      width="180">
      <template slot-scope="scope">
        <el-tooltip :content="scope.row.tooltip" placement="top-start"
          v-if="scope.row.type === 'GROUP'">
          <div>{{ scope.row.name }}</div>
        </el-tooltip>
        <div v-else>{{ scope.row.name }}</div>
      </template>
    </el-table-column>
    <el-table-column
    :label="__('threadType')"
      width="180">
      <template slot-scope="scope">
        <el-tag
          :type="determineThreadType(scope.row.type).tagType"
          close-transition>
          {{ determineThreadType(scope.row.type).name }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column
      prop="messageCount"
      sortable
      :label="__('threadMessageCount')"
      width="120">
    </el-table-column>
    <el-table-column
      prop="textCount"
      sortable
      :label="__('threadTextCount')"
      width="120">
    </el-table-column>
    <el-table-column
      :label="__('threadOperation')"
      width="360">
      <template slot-scope="scope">
        <el-button
          :disabled="!!scope.row.messages"
          @click="fetchMessages(scope.row)"
          :loading="loadings[scope.row.id]"
          type="text" size="small">
          <icon name="cloud-download"></icon>
          {{ (!scope.row.messages) ? __('importMessageHistory') : __('importedMessageHistory')}}
        </el-button>
        <el-button
          @click="downloadHistory(scope.row)"
          :loading="loadings[scope.row.id]"
          type="text"
          size="small">
          <icon name="download"></icon>
          {{ __('downloadMessageHistory') }}
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>
<script>
import 'vue-awesome/icons/cloud-download'
import 'vue-awesome/icons/download'
import Icon from 'vue-awesome/components/Icon'
import fetchThreadDetail from '../lib/fetchThreadDetail.js'
import downloadMessages from '../lib/downloadMessages.js'
const __ = chrome.i18n.getMessage

export default {
  name: 'Index',
  props: [ 'threadsInfo', 'token', 'selfId' ],
  components: {
    Icon
  },
  data: () => ({
    loadings: {}
  }),
  methods: {
    async fetchMessages (info) {
      if (!info.messages) {
        this.$set(this.loadings, info.id, true)
        const messageThread = await fetchThreadDetail({
          token: this.token, thread: info, $set: this.$set
        })
        this.$set(info, 'messages', messageThread.messages)
        this.$delete(this.loadings, info.id)
      }
      return info
    },
    async downloadHistory (info) {
      downloadMessages(await this.fetchMessages(info), this.selfId)
    },
    getSummaries ({ columns, data }) {
      const totalMessageCount = data.reduce((sum, row) => row.messageCount + sum, 0)
      return [__('totalMessageCount'), '', '', totalMessageCount]
    },
    determineThreadType (type) {
      switch (type) {
        case 'USER': return { name: __('user'), tagType: 'primary' }
        case 'PAGE': return { name: __('fanpage'), tagType: 'success' }
        case 'GROUP': return { name: __('group'), tagType: 'warning' }
      }
      return { name: __('unknown'), tagType: 'danger' }
    }
  }
}
</script>

<style>
  .el-tooltip__popper {
    max-width: 240px;
  }
</style>
