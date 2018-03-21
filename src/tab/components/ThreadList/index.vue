<template>
  <div>
    <div
      :class="{
        'operation-bar': true,
        'show-operation-buttons': selectedThreads.length
      }"
      style="padding: 20px">
      <div v-if="!selectedThreads.length" style="display: inline-flex">
        <el-form :inline="true" @submit.native.prevent style="display: inline-block" size="mini">
          <el-form-item :label="__('searchInputLabel') + __('colon')" class="operation-bar-form-item">
            <el-input
              style="height: 30px"
              :placeholder="__('searchInputPlaceholder')"
              v-model="keyword"
              :maxlength="120"></el-input>
          </el-form-item>
        </el-form>
        <operation-button
          @click="reset()"
          type="danger"
          icon="trash"
          :text="__('reset')"
          size="mini"
          class="operation-bar-button"
          round>
        </operation-button>
        <el-pagination
          style="display: inline-block"
          @size-change="(val) => (threadsPerPage = val)"
          :current-page.sync="currentPage"
          :page-sizes="[5, 10, 20, 40]"
          :page-size="10"
          layout="total, sizes, prev, pager, next, jumper"
          :total="tableData.length">
        </el-pagination>
      </div>
      <div v-if="selectedThreads.length">
        <el-button
          @click="$refs['thread-list'].clearSelection()"
          type="primary"
          class="operation-bar-button"
          size="small">
          Clear
        </el-button>
        Already select {{ selectedThreads.length }} threads
        <div class="operation-bar-float-right">
          <operation-button
            @click="fetchSelectedThreads()"
            type="primary"
            icon="cloud-download"
            :text="__('fetchDetailOfselected')"
            size="mini"
            class="operation-bar-button"
            round>
          </operation-button>
          <operation-button
            @click="downloadHistory()"
            type="primary"
            icon="download"
            :text="__('downloadMessageHistory')"
            size="mini"
            class="operation-bar-button"
            round>
          </operation-button>
        </div>
      </div>
    </div>
    <el-table
      ref="thread-list"
      :data="slicedTableData"
      :max-height="720"
      show-summary
      border
      class="thread-list-table"
      header-cell-class-name="thread-list-cell"
      cell-class-name="thread-list-cell"
      :summary-method="getSummaries"
      @selection-change="onSelect"
      @row-click.self="onRowClick"
      style="width: 100%">

      <el-table-column
        type="selection"
        width="55"
        class-name="select-box-cell"
        label-class-name="select-box-cell">
      </el-table-column>

      <el-table-column type="expand" width="60">
        <template slot-scope="{ row }">
          <detail-template :thread="row" @change="onChange" />
        </template>
      </el-table-column>

      <el-table-column prop="id" label="#" width="150"></el-table-column>

      <el-table-column prop="name" :label="__('threadName')">
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
        filter-placement="bottom-end"
        align="center">
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
        width="90"
        align="center">
        <template slot-scope="{ row }">
          <el-tag
            :type="determineThreadTag(row.tag).tagType"
            close-transition>
            {{ determineThreadTag(row.tag).name }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="messageCount" :label="__('threadMessageCount')"
        width="120" align="center"> </el-table-column>

      <el-table-column prop="characterCount" :label="__('threadCharacterCount')"
        width="120" align="center"> </el-table-column>

      <el-table-column :label="__('threadOperation')" width="150">
        <template slot-scope="{ row, $index }">
          <operation-button
            @click="generateImage(row, $index)"
            :disabled="row.type === 'GROUP'"
            icon="image"
            :text="__('generateSharingImage')">
          </operation-button>
          <operation-button
            @click="onShareOnFb(row, $index)"
            :disabled="row.type === 'GROUP'"
            icon="share-alt"
            :text="__('shareToFb')">
          </operation-button>
          <operation-button
            @click="fetchMessages(row)"
            icon="cloud-download"
            :text="(row.needUpdate) ? __('importMessageHistory') : __('importedMessageHistory')"
            :disabled="!row.needUpdate"
            :loading="row.isLoading">
          </operation-button>
          <operation-button
            @click="downloadHistory(row)"
            icon="download"
            :text="__('downloadMessageHistory')">
          </operation-button>
        </template>

      </el-table-column>
    </el-table>
    <sharing-dialog ref="sharingDialog" :jar="ctx.jar" />
  </div>
</template>

<script>
import 'vue-awesome/icons/cloud-download'
import 'vue-awesome/icons/download'
import Icon from 'vue-awesome/components/Icon'
import _get from 'lodash/get'
import downloadMessages from '@/tab/lib/downloadMessages.js'
import DetailTemplate from './DetailTemplate'
import NameTemplate from './NameTemplate'
import OperationButton from './OperationButton'
import SharingDialog from './../SharingDialog.vue'
import {
  changeThreadName,
  changeThreadNickname,
  changeThreadImage,
  muteThread,
  changeThreadColor,
  changeThreadEmoji
} from '@/tab/lib/changeThreadSetting.js'
import generateCanvas from '@/tab/lib/generateCanvas.js'
import shareOnFb from '@/tab/lib/shareOnFb.js'
const __ = chrome.i18n.getMessage

export default {
  name: 'ThreadList',

  props: [ 'value', 'page', 'ctx' ],

  components: { Icon, DetailTemplate, NameTemplate, OperationButton, SharingDialog },

  data () {
    return {
      keyword: this.$route.query.keyword || '',
      threadsPerPage: 10,
      currentPage: this.page,
      selectedThreads: [],
      test: false,
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
    slicedTableData () {
      return this.tableData.slice((this.currentPage - 1) * this.threadsPerPage,
        this.currentPage * this.threadsPerPage)
    },
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

      const ctx = { db: this.ctx.db, jar: this.ctx.jar }
      return Promise.all(this.selectedThreads.map((thread) => thread.loadDetail(ctx, this.$set)))
    },
    async fetchMessages (thread) {
      this.$ga.event('ThreadDetails', 'fetch', 'length', 1)

      const ctx = { db: this.ctx.db, jar: this.ctx.jar }
      return thread.loadDetail(ctx, this.$set)
    },
    async downloadHistory (thread) {
      this.$ga.event('Thread', 'download')

      const threads = (thread) ? [thread] : this.selectedThreads

      const loadedThreads = await Promise.all(threads.map(async (thread) => {
        if (thread.messages) {
          return thread
        } else {
          const cachedThread = await this.ctx.db.get(thread.id)
          if (cachedThread) {
            thread.messages = cachedThread.messages
            return thread
          } else {
            return this.fetchMessages(thread)
          }
        }
      }))

      return downloadMessages(loadedThreads, this.ctx.jar.selfId)
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
      const funcArgs = [ this.ctx.jar, thread, ...args ]
      return func(...funcArgs)
        .then((res) => {
          if (res.error) {
            const err = new Error(res.errorDescription)
            err.message = res.errorSummary
            throw err
          }
          return res
        })
        .then(() => thread.reload(this.ctx.jar))
        .catch((err) => console.error(err))
    },
    async generateImage (thread, index) {
      /** @see https://developers.facebook.com/docs/sharing/best-practices/#images **/
      const imageSize = { width: 1200, height: 630 }

      this.$refs.sharingDialog.canvas = await generateCanvas(thread, index, imageSize, this.ctx.jar)
      this.$refs.sharingDialog.show()
    },
    async onShareOnFb (thread, index) {
      /** @see https://developers.facebook.com/docs/sharing/best-practices/#images **/
      const imageSize = { width: 1200, height: 630 }
      const canvas = await generateCanvas(thread, index, imageSize, this.ctx.jar)
      return shareOnFb(canvas, this.ctx.jar)
    },
    reset () {
      this.$ga.event('Threads', 'reset')

      return this.$confirm(__('resetConfirmContent'), __('resetConfirmTitle'), {
        confirmButtonText: __('sure'),
        showCancelButton: true,
        cancelButtonText: __('cancel'),
        center: true
      }).then(() => this.ctx.db.destroy(), () => null)
    },
    getSummaries ({ columns, data }) {
      const totalMessageCount = data.reduce((sum, row) => row.messageCount + sum, 0)
      const totalTextCount = data.reduce((sum, row) => row.characterCount + sum, 0)
      return ['', '', '', '', '', '', totalMessageCount, totalTextCount]
    },
    onSelect (items) {
      this.selectedThreads = items
    },
    onRowClick (row, event, column) {
      this.$refs['thread-list'].toggleRowExpansion(row)
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
    }
  }
}
</script>

<style>
.el-table__row {
  cursor: pointer;
}
.el-table__expand-icon>.el-icon-arrow-right:before {
  color: #f03c24;
  font-size: 16px;
}
.thread-list-cell, .thread-list-table {
  border-color: #dcdfe6 !important;
}
.select-box-cell {
  text-align: center;
}
</style>

<style scoped>
.operation-bar {
  min-height: 32px;
  padding: 20px;
  border: 1px solid #dcdfe6;
  border-bottom: none;
  transition: color .15s ease, background-color .15s ease;
}
.show-operation-buttons {
  color: white;
  background-color: rgb(0, 131, 255);
  transition: color .15s ease, background-color .15s ease;
}
.operation-bar-float-right {
  display: inline-block;
  float: right;
  margin-right: 25px;
}
.operation-bar-button {
  padding: 6px;
  margin-left: 0px;
}
.operation-bar-form-item {
  margin-bottom: 0px
}
</style>
