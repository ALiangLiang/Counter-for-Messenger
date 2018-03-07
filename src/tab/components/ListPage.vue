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
        <el-form-item>
          <el-button type="danger" @click="reset()">
            {{ __('reset') }}
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
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column type="expand" width="60">
        <template slot-scope="props">
          <el-form :inline="true" class="thread-form-inline">
            <el-form-item label="Emoji:">
              <chooser
                type="emoji"
                @change="onChangeEmoji(props.row, $event)"
                v-model="props.row.emoji"></chooser>
            </el-form-item>
            <el-form-item label="Color:">
              <chooser
                type="color"
                @change="onChangeColor(props.row, $event)"
                v-model="props.row.color"></chooser>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column prop="id" sortable label="#" width="150"></el-table-column>
      <el-table-column prop="name" :label="__('threadName')" width="210">
        <template slot-scope="{ row }">
          <div class="outer-name">
            <avatar
              :images="(row.image) ? [{ text: row.threadName, src: row.image}] : row.participants.map((p) => ({ text: p.user.name, src: p.user.avatar }))"
              :allow-upload="row.type === 'GROUP'"
              @change="onChangeThreadImage(row, $event)" />
            <thread-name
              class="thread-name"
              :thread="row"
              @change="((row.type === 'GROUP') ? onChangeThreadName : onChangeNickname)(row, $event)"></thread-name>
          </div>
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
import Thread from '../classes/Thread.js'
import Avatar from './Avatar.vue'
import Chooser from './Chooser.vue'
import ThreadName from './ThreadName.vue'
import fetchThreadDetail from '../lib/fetchThreadDetail.js'
import downloadMessages from '../lib/downloadMessages.js'
import {
  changeThreadName,
  changeThreadNickname,
  changeThreadImage,
  changeThreadColor,
  changeThreadEmoji
} from '../lib/changeThreadSetting.js'
const __ = chrome.i18n.getMessage

export default {
  name: 'ListPage',

  props: [ 'threadsInfo', 'jar', 'db' ],

  components: { Icon, Avatar, Chooser, ThreadName },

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
      return this.threadsInfo.filter((thread) =>
        thread.threadName.match(new RegExp(this.keyword, 'i')))
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
    getSummaries ({ columns, data }) {
      const totalMessageCount = data.reduce((sum, row) => row.messageCount + sum, 0)
      const totalTextCount = data.reduce((sum, row) => row.characterCount + sum, 0)
      return ['', '', '', '', '', totalMessageCount, totalTextCount]
    },
    onSelect (items) {
      this.selectedThreads = items
    },
    onChangeThreadName (thread, [ threadName ]) {
      return changeThreadName(this.jar, thread, threadName)
    },
    onChangeNickname (thread, [ nickname, otherUserId ]) {
      return changeThreadNickname(this.jar, thread, otherUserId, nickname)
    },
    onChangeThreadImage (thread, image) {
      return changeThreadImage(this.jar, thread, image)
    },
    onChangeColor (thread, color) {
      return changeThreadColor(this.jar, thread, color)
    },
    onChangeEmoji (thread, emoji) {
      return changeThreadEmoji(this.jar, thread, emoji)
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

<style scoped>
.outer-name {
  display: inline-block;
  position: relative;
}
.outer-name div, span {
  display: inline-block;
  vertical-align: middle;
}
.color-box {
  width: 14px;
  height: 14px;
  display: inline-block;
}
.thread-name {
  max-width: 150px;
}
.thread-form-inline>.el-form-item {
  margin-bottom: 0;
}
.thread-form-inline>div:nth-child(n+2) {
  border-left: 1px solid #e6e6e6;
  padding-left: 12px;
}
</style>
