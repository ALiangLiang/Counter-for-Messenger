<template>
  <div>
    <div style="margin: 20px">
      <el-form :inline="true">
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
      </el-form>
      <el-pagination
        @size-change="(val) => (threadsPerPage = val)"
        :current-page.sync="currentPage"
        :page-sizes="[5, 10, 20, 40]"
        :page-size="10"
        layout="total, sizes, prev, pager, next, jumper"
        :total="tableData.length">
      </el-pagination>
    </div>
    <el-table
      :data="tableData.slice((currentPage - 1) * threadsPerPage, currentPage * threadsPerPage)"
      :max-height="720"
      show-summary
      :summary-method="getSummaries"
      @selection-change="onSelect"
      style="width: 100%">
      <el-table-column type="selection" width="55"> </el-table-column>
      <el-table-column prop="id" sortable label="#" width="180"> </el-table-column>
      <el-table-column prop="name" :label="__('threadName')" width="180">
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
        width="180"
        :filters="typeFilters"
        :filter-method="typeFilterMethod"
        filter-placement="bottom-end">
        <template slot-scope="{ row }">
          <el-tag
            :type="determineThreadType(row.type).tagType"
            close-transition>
            {{ determineThreadType(row.type).name }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="messageCount" sortable :label="__('threadMessageCount')"
        width="120"> </el-table-column>
      <el-table-column prop="textCount" sortable :label="__('threadTextCount')"
        width="120"> </el-table-column>
      <el-table-column :label="__('threadOperation')" width="360">
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
import Thread from '../classes/Thread.js'
import fetchThreadDetail from '../lib/fetchThreadDetail.js'
import downloadMessages from '../lib/downloadMessages.js'
const __ = chrome.i18n.getMessage

export default {
  name: 'Index',
  props: [ 'threadsInfo', 'token', 'selfId', 'db' ],
  components: {
    Icon
  },
  data () {
    return {
      keyword: '',
      threadsPerPage: 10,
      currentPage: 1,
      selectedThreads: [],
      typeFilters: [ 'GROUP', 'USER', 'PAGE', 'REDUCEDMESSAGINGACTOR' ]
        .map((type) => ({
          text: this.determineThreadType(type).name,
          value: type
        }))
    }
  },
  computed: {
    tableData () {
      return this.threadsInfo.filter((thread) => thread.name.match(this.keyword))
    }
  },
  methods: {
    async fetchSelectedThreads () {
      const allCacheThreads = await this.db.getAll()
      const results = await Promise.all(this.selectedThreads.map(async (thread) => {
        thread.isLoading = true

        const cachedThread = allCacheThreads.find((cacheThread) =>
          cacheThread.id === thread.id)

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
          thread.textCount = Thread.culTextCount(updatedMessages)
          thread.needUpdate = false
          thread.isLoading = false
        }
      })
    },
    async fetchMessages (thread) {
      thread.isLoading = true
      const cachedThread = await this.db.get(thread.id)
      let messageLimit
      if (cachedThread) {
        const cachedThreadMessagesLength = _get(cachedThread, 'messages.length')
        if (cachedThreadMessagesLength !== undefined) {
          if (cachedThreadMessagesLength === thread.messageCount) { // No need to update cache.
            thread.isLoading = false
            return
          }
          messageLimit = thread.messageCount - cachedThreadMessagesLength
        }
      }

      if (!thread.messages) {
        const result = await fetchThreadDetail({
          token: this.token, thread, $set: this.$set, messageLimit
        })
        thread.messages = (_get(cachedThread, 'messages') || []).concat(result)
        thread.textCount = Thread.culTextCount(thread.messages)
        this.db.put({ id: thread.id, messages: thread.messages })
        thread.needUpdate = false
        thread.isLoading = false
      }
      return thread
    },
    async downloadHistory (thread) {
      if (thread.messages) {
        return downloadMessages(thread, this.selfId)
      } else {
        const cachedThread = await this.db.get(thread.id)
        if (cachedThread) {
          thread.messages = cachedThread.messages
          return downloadMessages(thread, this.selfId)
        } else {
          return downloadMessages(await this.fetchMessages(thread), this.selfId)
        }
      }
    },
    getSummaries ({ columns, data }) {
      const totalMessageCount = data.reduce((sum, row) => row.messageCount + sum, 0)
      const totalTextCount = data.reduce((sum, row) => row.textCount + sum, 0)
      return ['', '', '', '', totalMessageCount, totalTextCount]
    },
    onSelect (items) {
      this.selectedThreads = items
    },
    determineThreadType (type) {
      switch (type) {
        case 'USER': return { name: __('user'), tagType: 'primary' }
        case 'PAGE': return { name: __('fanpage'), tagType: 'success' }
        case 'GROUP': return { name: __('group'), tagType: 'warning' }
        case 'REDUCEDMESSAGINGACTOR': return { name: __('unknown'), tagType: 'danger' }
      }
      return { name: __('unknown'), tagType: 'danger' }
    },
    typeFilterMethod (value, row, column) {
      const property = column['property']
      return row[property] === value
    }
  }
}
</script>

<style>
  .el-tooltip__popper {
    max-width: 240px;
  }
</style>
