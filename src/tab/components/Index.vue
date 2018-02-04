<template>
  <div>
    <el-table
      :data="threadsInfo"
      :max-height="720"
      show-summary
      :summary-method="getSummaries"
      @selection-change="handleSelectionChange"
      style="width: 100%">
      <el-table-column
        type="selection"
        width="55">
      </el-table-column>
      <el-table-column
        prop="id"
        sortable
        label="#"
        width="180">
      </el-table-column>
      <el-table-column
        prop="name"
        :label="__('threadName')"
        width="180">
        <template slot-scope="{ row }">
          <el-tooltip :content="row.tooltip" placement="top-start"
            v-if="row.type === 'GROUP'">
            <div>{{ row.name }}</div>
          </el-tooltip>
          <div v-else>{{ row.name }}</div>
        </template>
      </el-table-column>
      <el-table-column
        prop="type"
        :label="__('threadType')"
        width="180">
        <template slot-scope="{ row }">
          <el-tag
            :type="determineThreadType(row.type).tagType"
            close-transition>
            {{ determineThreadType(row.type).name }}
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
        <template slot-scope="{ row }">
          <el-button
            :disabled="row.textCount !== null"
            @click="fetchMessages(row)"
            type="text" size="small">
            <icon name="cloud-download"></icon>
            {{ (row.textCount === null) ? __('importMessageHistory') : __('importedMessageHistory')}}
          </el-button>
          <el-button
            @click="downloadHistory(row)"
            type="text"
            size="small">
            <icon name="download"></icon>
            {{ __('downloadMessageHistory') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin-top: 20px">
      <el-button @click="fetchDetailOfSelected()">{{ __('fetchDetailOfselected') }}</el-button>
      <span style="margin-left: 20px;">
        Threads: {{ threadsInfo.length }},
        Selected threads: {{ selectedThreads.length }},
        <i class="el-icon-loading" v-if="loadingCount"></i>
        Loading threads: {{ loadingCount }},
        Loaded threads: {{ loadedCount }}
        Last loading time: {{ (lastSpendTime / 1000).toFixed(1) }}sec
      </span>
    </div>
  </div>
</template>
<script>
import 'vue-awesome/icons/spinner'
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
    isLoading: false,
    loadingCount: 0,
    loadedCount: 0,
    lastSpendTime: 0,
    selectedThreads: []
  }),
  methods: {
    async fetchMessages (thread) {
      if (!thread.messages) {
        this.loadingCount += 1
        await fetchThreadDetail({
          token: this.token, thread, $set: this.$set
        })
        this.loadingCount -= 1
        this.loadedCount += 1
      }
      return thread
    },
    async downloadHistory (info) {
      downloadMessages(await this.fetchMessages(info), this.selfId)
    },
    getSummaries ({ columns, data }) {
      const totalMessageCount = data.reduce((sum, row) => row.messageCount + sum, 0)
      return ['', '', '', '', `${__('totalMessageCount')}: ${totalMessageCount}`]
    },
    handleSelectionChange (val) {
      this.selectedThreads = val
    },
    async fetchDetailOfSelected () {
      const startTime = new Date()
      await Promise.all(this.selectedThreads.map(async (seletedThread) => {
        if (seletedThread.messages || seletedThread.isLoading) return
        this.loadingCount += 1
        await fetchThreadDetail({
          token: this.token, thread: seletedThread, $set: this.$set
        })
        this.loadingCount -= 1
        this.loadedCount += 1
      }))
      this.lastSpendTime = new Date() - startTime
    },
    determineThreadType (type) {
      switch (type) {
        case 'USER': return { name: __('user'), tagType: 'primary' }
        case 'PAGE': return { name: __('fanpage'), tagType: 'success' }
        case 'GROUP': return { name: __('group'), tagType: 'warning' }
        case 'REDUCEDMESSAGINGACTOR': return { name: __('unknown'), tagType: 'danger' }
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
