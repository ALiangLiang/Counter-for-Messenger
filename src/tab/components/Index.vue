<template>
  <el-table
    :data="threadsInfo"
    :max-height="720"
    show-summary
    :summary-method="getSummaries"
    style="width: 100%">
    <el-table-column
      prop="threadId"
      sortable
      label="#"
      width="180">
    </el-table-column>
    <el-table-column
      prop="name"
      label="名稱"
      width="180">
    </el-table-column>
    <el-table-column
      label="種類"
      width="180">
      <template slot-scope="scope">
        <el-tag
          :type="(scope.row.type === 'ONE_TO_ONE') ? 'primary' : 'success'"
          close-transition>
          {{ (scope.row.type === 'ONE_TO_ONE') ? '用戶' : '群組' }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column
      prop="messageCount"
      sortable
      label="訊息數量"
      width="120">
    </el-table-column>
    <el-table-column
      label="操作"
      width="360">
      <template slot-scope="scope">
        <el-button
          :disabled="!!scope.row.messages"
          @click="fetchMessages(scope.row)"
          :loading="loadings[scope.row.threadId]"
          type="text" size="small">
          <icon name="cloud-download"></icon>
          {{ (!scope.row.messages) ? '載入訊息記錄' : '已載入'}}
        </el-button>
        <el-button
          @click="downloadHistory(scope.row)"
          :loading="loadings[scope.row.threadId]"
          type="text"
          size="small">
          <icon name="download"></icon>
          儲存/下載訊息記錄
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>
<script>
import 'vue-awesome/icons/cloud-download'
import 'vue-awesome/icons/download'
import Icon from 'vue-awesome/components/Icon'
import fetchThreadMessages from './fetchThreadMessages.js'
import downloadMessages from './downloadMessages.js'
// const __ = chrome.i18n.getMessage

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
        this.$set(this.loadings, info.threadId, true)
        const messageThread = await fetchThreadMessages(this.token, info.threadId)
        this.$set(info, 'messages', messageThread.messages)
        this.$delete(this.loadings, info.threadId)
      }
      return info
    },
    async downloadHistory (info) {
      downloadMessages(await this.fetchMessages(info), this.selfId)
    },
    getSummaries ({ columns, data }) {
      const totalMessageCount = data.reduce((sum, row) => row.messageCount + sum, 0)
      return ['Total Messages', '', '', totalMessageCount]
    }
  }
}
</script>

<style scoped>
</style>
