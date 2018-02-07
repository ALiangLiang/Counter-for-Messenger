<template>
  <div>
    <div style="margin: 20px">
      <el-button @click="fetchSelectedThreads()">{{ __('fetchDetailOfselected') }}</el-button>
      <el-pagination
        @size-change="(val) => (threadsPerPage = val)"
        :current-page.sync="currentPage"
        :page-sizes="[5, 10, 20, 40]"
        :page-size="10"
        layout="total, sizes, prev, pager, next, jumper"
        :total="threadsInfo.length">
      </el-pagination>
    </div>
    <el-table
      :data="threadsInfo.slice((currentPage - 1) * threadsPerPage, currentPage * threadsPerPage)"
      :max-height="720"
      show-summary
      :summary-method="getSummaries"
      @selection-change="onSelect"
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
            :disabled="!row.needUpdate"
            :loading="row.isLoading"
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
  </div>
</template>
<script>
import 'vue-awesome/icons/spinner'
import 'vue-awesome/icons/cloud-download'
import 'vue-awesome/icons/download'
import Icon from 'vue-awesome/components/Icon'
import _get from 'lodash/get'
import fetchThreadDetail from '../lib/fetchThreadDetail.js'
import downloadMessages from '../lib/downloadMessages.js'
const __ = chrome.i18n.getMessage

export default {
  name: 'Index',
  props: [ 'threadsInfo', 'token', 'selfId', 'db' ],
  components: {
    Icon
  },
  data: () => ({
    isLoading: false,
    loadingCount: 0,
    loadedCount: 0,
    lastSpendTime: 0,
    threadsPerPage: 10,
    currentPage: 1,
    selectedThreads: []
  }),
  methods: {
    async fetchSelectedThreads () {
      const allCacheThreads = await this.db.getAll()
      const results = await Promise.all(this.selectedThreads.map(async (thread) => {
        thread.isLoading = true

        const cachedThread = allCacheThreads.find((cacheThread) =>
          cacheThread.id === thread.id)
        console.log(thread)
        let messageLimit
        if (cachedThread) {
          const cachedThreadMessagesLength = _get(cachedThread, 'messages.length')
          if (cachedThreadMessagesLength !== undefined) {
            if (cachedThreadMessagesLength >= thread.messageCount) { // No need to update cache.
              return []
            }
            messageLimit = thread.messageCount - cachedThreadMessagesLength
          }
        }
        console.log(messageLimit)
        if (!thread.messages) {
          const result = await fetchThreadDetail({
            token: this.token, thread, $set: this.$set, messageLimit
          })
          const updatedMessages = (_get(cachedThread, 'messages') || []).concat(result)
          this.db.put({ id: thread.id, messages: updatedMessages })
          return [thread, updatedMessages]
        }
        return [thread]
      }))

      results.forEach(([thread, updatedMessages]) => {
        if (updatedMessages) {
          thread.textCount = updatedMessages.reduce((cur, message) =>
            ((message.text) ? message.text.length : 0) + cur, 0)
          thread.needUpdate = false
          thread.isLoading = false
        }
      })
    },
    async fetchMessages (thread) {
      const cachedThread = await this.db.get(thread.id)
      let messageLimit
      if (cachedThread) {
        const cachedThreadMessagesLength = _get(cachedThread, 'messages.length')
        if (cachedThreadMessagesLength !== undefined) {
          if (cachedThreadMessagesLength === thread.messageCount) { // No need to update cache.
            return
          }
          messageLimit = thread.messageCount - cachedThreadMessagesLength
        }
      }

      if (!thread.messages) {
        this.loadingCount += 1
        const result = await fetchThreadDetail({
          token: this.token, thread, $set: this.$set, messageLimit
        })
        thread.messages = (_get(cachedThread, 'messages') || []).concat(result)
        this.db.put({ id: thread.id, messages: thread.messages })
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
    onSelect (items) {
      this.selectedThreads = items
    },
    selectAllThread (e) {
      if (e.target.value === 'on') {
        this.selectedThreads = Array.from(this.threadsInfo)
      } else {
        this.selectedThreads = []
      }
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
