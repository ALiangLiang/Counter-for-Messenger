<template>
  <div>
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
    <thread-list v-model="ctx.threads" :keyword="keyword" :page="page" :jar="ctx.jar" :db="ctx.db">
    </thread-list>
  </div>
</template>

<script>
import _get from 'lodash/get'
import Thread from '../classes/Thread.js'
import ThreadList from './ThreadList'
import fetchThreadDetail from '../lib/fetchThreadDetail.js'
import downloadMessages from '../lib/downloadMessages.js'
import {
  changeThreadName,
  changeThreadNickname,
  changeThreadImage,
  muteThread,
  changeThreadColor,
  changeThreadEmoji
} from '../lib/changeThreadSetting.js'
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
    async fetchSelectedThreads () {
      this.$ga.event('ThreadDetails', 'fetch', 'length', this.selectedThreads.length)

      const allCacheThreads = await this.ctx.db.getAll()
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
          this.ctx.db.put({ id: thread.id, messages: updatedMessages })
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
      const cachedThread = await this.ctx.db.get(thread.id)
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
          jar: this.ctx.jar, thread, $set: this.$set, messageLimit
        })
        thread.messages = (_get(cachedThread, 'messages') || []).concat(result)
        thread.characterCount = Thread.culCharacterCount(thread.messages)
        this.ctx.db.put({ id: thread.id, messages: thread.messages })
        thread.needUpdate = false
        thread.isLoading = false
      }
      return thread
    },
    async downloadHistory (thread) {
      this.$ga.event('Thread', 'download')

      if (thread.messages) {
        return downloadMessages(thread, this.ctx.jar.selfId)
      } else {
        const cachedThread = await this.ctx.db.get(thread.id)
        if (cachedThread) {
          thread.messages = cachedThread.messages
          return downloadMessages(thread, this.ctx.jar.selfId)
        } else {
          return downloadMessages(await this.fetchMessages(thread), this.ctx.jar.selfId)
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
      this.$ga.event('Thread', 'set', 'name')
      return changeThreadName(this.ctx.jar, thread, threadName)
    },
    onChangeNickname (thread, [ nickname, otherUserId ]) {
      this.$ga.event('Thread', 'set', 'nickname')
      return changeThreadNickname(this.ctx.jar, thread, otherUserId, nickname)
    },
    onChangeThreadImage (thread, image) {
      this.$ga.event('Thread', 'set', 'image')
      return changeThreadImage(this.ctx.jar, thread, image)
    },
    onMuteThread (thread, muteSeconds) {
      this.$ga.event('Thread', 'set', 'mute', muteSeconds)
      return muteThread(this.ctx.jar, thread, muteSeconds)
    },
    onChangeColor (thread, color) {
      this.$ga.event('Thread', 'set', 'color')
      return changeThreadColor(this.ctx.jar, thread, color)
    },
    onChangeEmoji (thread, emoji) {
      this.$ga.event('Thread', 'set', 'emoji')
      return changeThreadEmoji(this.ctx.jar, thread, emoji)
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
