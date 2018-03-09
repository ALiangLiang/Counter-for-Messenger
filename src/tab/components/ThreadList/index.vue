<template>
  <div>
    <div style="margin: 20px">
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
      :data="tableData.slice((this.currentPage - 1) * this.threadsPerPage, this.currentPage * this.threadsPerPage)"
      :max-height="720"
      show-summary
      :summary-method="getSummaries"
      @selection-change="onSelect"
      style="width: 100%">
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column type="expand" width="60">
        <template slot-scope="{ row }">
          <detail-template :thread="row" @change="onChange" />
        </template>
      </el-table-column>
      <el-table-column prop="id" sortable label="#" width="150"></el-table-column>
      <el-table-column prop="name" :label="__('threadName')" width="210">
        <template slot-scope="{ row }">
          <name-template :thread="row" @change="onChange" />
        </template>
      </el-table-column>
      <el-table-column
        prop="type"
        :label="__('threadType')"
        width="90"
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
      <el-table-column
        prop="tag"
        :label="__('threadTag')"
        width="90">
        <template slot-scope="{ row }">
          <el-tag
            :type="determineThreadTag(row.tag).tagType"
            close-transition>
            {{ determineThreadTag(row.tag).name }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="messageCount" sortable :label="__('threadMessageCount')"
        width="120"> </el-table-column>
      <el-table-column prop="characterCount" sortable :label="__('threadCharacterCount')"
        width="120"> </el-table-column>
      <el-table-column :label="__('threadOperation')" width="300">
        <template slot-scope="{ row }">
          <el-button
            :disabled="!row.needUpdate"
            :loading="row.isLoading"
            @click="fetchMessages(row)"
            type="text" size="small">
            <icon name="cloud-download"></icon>
            {{ (row.needUpdate) ? __('importMessageHistory') : __('importedMessageHistory')}}
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
import Thread from '../../classes/Thread.js'
import fetchThreadDetail from '../../lib/fetchThreadDetail.js'
import downloadMessages from '../../lib/downloadMessages.js'
import DetailTemplate from './DetailTemplate'
import NameTemplate from './NameTemplate'
import {
  changeThreadName,
  changeThreadNickname,
  changeThreadImage,
  muteThread,
  changeThreadColor,
  changeThreadEmoji
} from '../../lib/changeThreadSetting.js'
const __ = chrome.i18n.getMessage

export default {
  name: 'ThreadList',

  props: [ 'value', 'keyword', 'page', 'jar' ],

  components: { Icon, DetailTemplate, NameTemplate },

  data () {
    return {
      threadsPerPage: 10,
      currentPage: this.page,
      selectedThreads: [],
      typeFilters: [ 'GROUP', 'USER', 'PAGE', 'REDUCEDMESSAGINGACTOR' ]
        .map((type) => ({
          text: this.determineThreadType(type).name,
          value: type
        }))
    }
  },

  watch: {
    page (val) {
      this.currentPage = val
    }
  },

  computed: {
    tableData () {
      const regexPattern = new RegExp(this.keyword, 'i')
      // filter
      return this.value.filter((thread) =>
        !!(thread.threadName || '').match(regexPattern) || // search thread display name
        !!(thread.id || '').match(regexPattern) || // search id
        thread.participants.some((participant) =>
          // search participants's name
          (_get(participant, 'user.name', '') || '').match(regexPattern) ||
          // search participants's nickname
          (_get(participant, 'user.nickname', '') || '').match(regexPattern) ||
          // search participants's id
          (_get(participant, 'user.id', '') || '').match(regexPattern)))
    }
  },

  methods: {
    async fetchSelectedThreads () {
      this.$ga.event('ThreadDetails', 'fetch', 'length', this.selectedThreads.length)

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
            jar: this.jar, thread, $set: this.$set, messageLimit
          })
          const updatedMessages = (_get(cachedThread, 'messages') || []).concat(result)
          this.db.put({ id: thread.id, messages: updatedMessages })
          return [thread, updatedMessages]
        }
        return [thread]
      }))

      results.forEach(([thread, updatedMessages]) => {
        if (updatedMessages) {
          thread.characterCount = Thread.culCharacterCount(updatedMessages)
          thread.needUpdate = false
          thread.isLoading = false
        }
      })
    },
    async fetchMessages (thread) {
      this.$ga.event('ThreadDetails', 'fetch', 'length', 1)

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
          jar: this.jar, thread, $set: this.$set, messageLimit
        })
        thread.messages = (_get(cachedThread, 'messages') || []).concat(result)
        thread.characterCount = Thread.culCharacterCount(thread.messages)
        this.db.put({ id: thread.id, messages: thread.messages })
        thread.needUpdate = false
        thread.isLoading = false
      }
      return thread
    },
    async downloadHistory (thread) {
      this.$ga.event('Thread', 'download')

      if (thread.messages) {
        return downloadMessages(thread, this.jar.selfId)
      } else {
        const cachedThread = await this.db.get(thread.id)
        if (cachedThread) {
          thread.messages = cachedThread.messages
          return downloadMessages(thread, this.jar.selfId)
        } else {
          return downloadMessages(await this.fetchMessages(thread), this.jar.selfId)
        }
      }
    },
    onChange (type, thread, ...args) {
      function determinFunc () {
        switch (type) {
          case 'name': return changeThreadName
          case 'nickname': return changeThreadNickname
          case 'image': return changeThreadImage
          case 'mute': return muteThread
          case 'color': return changeThreadColor
          case 'emoji': return changeThreadEmoji
          default: throw new Error('No type named: ' + type)
        }
      }

      const func = determinFunc()
      const funcArgs = [ this.jar, thread, ...args ]
      func(...funcArgs)
        .then((res) => {
          if (res.error) {
            const err = new Error(res.errorDescription)
            err.message = res.errorSummary
            throw err
          }
          return res
        })
        .then(() => thread.reload(this.jar))
        .catch((err) => console.error(err))
    },
    getSummaries ({ columns, data }) {
      const totalMessageCount = data.reduce((sum, row) => row.messageCount + sum, 0)
      const totalTextCount = data.reduce((sum, row) => row.characterCount + sum, 0)
      return ['', '', '', '', '', totalMessageCount, totalTextCount]
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
    determineThreadTag (tag) {
      switch (tag) {
        case 'INBOX': return { name: __('inbox'), tagType: 'primary' }
        case 'ARCHIVED': return { name: __('archived'), tagType: 'success' }
        case 'PENDING': return { name: __('pending'), tagType: 'warning' }
      }
      return { name: __('unknown'), tagType: 'danger' }
    },
    typeFilterMethod (value, row, column) {
      const property = column['property']
      return row[property] === value
    },
    reset () {
      return this.$confirm(__('resetConfirmContent'), __('resetConfirmTitle'), {
        confirmButtonText: __('sure'),
        showCancelButton: true,
        cancelButtonText: __('cancel'),
        center: true
      }).then(() => this.db.destroy(), () => null)
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
