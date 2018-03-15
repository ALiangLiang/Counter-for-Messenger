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
      ref="thread-list"
      :data="tableData.slice((this.currentPage - 1) * this.threadsPerPage, this.currentPage * this.threadsPerPage)"
      :max-height="720"
      show-summary
      border
      :summary-method="getSummaries"
      @selection-change="onSelect"
      @row-click.self="onRowClick"
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
      <el-table-column prop="messageCount" sortable :label="__('threadMessageCount')"
        width="120" align="center"> </el-table-column>
      <el-table-column prop="characterCount" sortable :label="__('threadCharacterCount')"
        width="120" align="center"> </el-table-column>
      <el-table-column :label="__('threadOperation')" width="300">
        <template slot-scope="{ row, $index }">
          <operation-button
            @click="shareOnFb(row, $index)"
            icon="share-alt"
            text="Share on Facebook">
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
  </div>
</template>

<script>
import _get from 'lodash/get'
import { toQuerystring, uploadImage } from '../../lib/util.js'
import downloadMessages from '../../lib/downloadMessages.js'
import DetailTemplate from './DetailTemplate'
import NameTemplate from './NameTemplate'
import OperationButton from './OperationButton'
import {
  changeThreadName,
  changeThreadNickname,
  changeThreadImage,
  muteThread,
  changeThreadColor,
  changeThreadEmoji
} from '../../lib/changeThreadSetting.js'
import { fb } from '../../../../core/.env.js'
const __ = chrome.i18n.getMessage

export default {
  name: 'ThreadList',

  props: [ 'value', 'keyword', 'page', 'jar', 'db' ],

  components: { DetailTemplate, NameTemplate, OperationButton },

  data () {
    return {
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

      const ctx = { db: this.db, jar: this.jar }
      return this.selectedThreads.map((thread) => thread.loadDetail(ctx, this.$set))
    },
    async fetchMessages (thread) {
      this.$ga.event('ThreadDetails', 'fetch', 'length', 1)

      const ctx = { db: this.db, jar: this.jar }
      return thread.loadDetail(ctx, this.$set)
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
      return func(...funcArgs)
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
    async shareOnFb (thread, index) {
      function loadImage (src) {
        const img = new Image()
        img.crossOrigin = 'Anonymous'
        img.src = src
        return new Promise((resolve, reject) => (img.onload = () => resolve(img)))
      }

      try {
        /** @see https://developers.facebook.com/docs/sharing/best-practices/#images **/
        const imageSize = { width: 1200, height: 630 }

        const avatarWidth = 150
        const userNameSize = 40
        const avatarPosition = [ [ 100, 220 ], [ imageSize.width - avatarWidth - 100, 220 ] ]
        const lineHeight = 10
        const fontSet = 'Verdana, Microsoft JhengHei'

        // draw sharing image
        const canvas = document.createElement('canvas')
        canvas.width = imageSize.width
        canvas.height = imageSize.height
        const ctx = canvas.getContext('2d')
        // paste background
        const img = await loadImage('../assets/background-1200x630.png')
        ctx.drawImage(img, 0, 0)
        const [ leftUser, rightUser ] = thread.participants.map((participant) => participant.user)
        const [ leftImg, rightImg ] = await Promise.all([ loadImage(leftUser.avatar), loadImage(rightUser.avatar) ])
        // placed avatars
        ctx.drawImage(leftImg, avatarPosition[0][0], avatarPosition[0][1], avatarWidth, avatarWidth)
        ctx.drawImage(rightImg, avatarPosition[1][0], avatarPosition[1][1], avatarWidth, avatarWidth)
        // write user name
        ctx.font = `${userNameSize}px ${fontSet}`
        ctx.fillStyle = '#fff'
        ctx.textAlign = 'center'
        ctx.fillText(leftUser.name, avatarPosition[0][0] + avatarWidth / 2, avatarPosition[0][1] + avatarWidth + userNameSize + 10)
        ctx.fillText(rightUser.name, avatarPosition[1][0] + avatarWidth / 2, avatarPosition[1][1] + avatarWidth + userNameSize + 10)
        // write message count
        ctx.font = `60px ${fontSet}`
        ctx.fillStyle = '#fff'
        ctx.textAlign = 'center'
        let textOffsetY = 200
        ctx.fillText('They have', imageSize.width / 2, textOffsetY += 60 + lineHeight)
        ctx.font = `90px ${fontSet}`
        ctx.fillText(thread.messageCount, imageSize.width / 2, textOffsetY += 90 + lineHeight)
        ctx.font = `60px ${fontSet}`
        ctx.fillText('messages!!', imageSize.width / 2, textOffsetY += 60 + lineHeight)
        // write rank
        ctx.fillText(`${leftUser.name} is #${index + 1} of ${rightUser.name}'s friends`, imageSize.width / 2, textOffsetY += 60 + 30)

        // output blob
        const blob = await new Promise((resolve, reject) => canvas.toBlob(resolve))

        // upload image to fb
        const metadata = (await uploadImage(this.jar, blob)).payload.metadata[0]

        // construct fb sharing dialog url
        const channelUrlHash = toQuerystring({
          cb: 'f2c3a60a05f73a4',
          domain: fb.domain,
          origin: fb.website,
          relation: 'opener'
        })
        const channelUrl = 'http://staticxx.facebook.com/connect/xd_arbiter/r/Ms1VZf1Vg1J.js?version=42#' + channelUrlHash
        const next = `${channelUrl}&relation=opener&frame=f236fd3a78b853&result=%22xxRESULTTOKENxx%22`
        const qs = toQuerystring({
          action_properties: {
            object: {
              'og:url': fb.website,
              'og:title': __('extName'),
              'og:description': __('extDescription'),
              'og:image': metadata.src,
              'og:image:width': imageSize.width,
              'og:image:height': imageSize.height,
              'og:image:type': metadata.filetype
            }
          },
          action_type: 'og.likes', // Coz "og.shares" cannot show bigger preview image, use "og.likes" instead of "og.shares".
          app_id: fb.id,
          channel_url: channelUrl,
          e2e: {},
          locale: __('@@ui_locale'),
          mobile_iframe: false,
          next,
          sdk: 'joey',
          version: fb.version
        })
        const url = `https://www.facebook.com/${fb.version}/dialog/share_open_graph?${qs}`

        // create fb dialog page
        chrome.tabs.create({
          url
        })
      } catch (err) {
        console.error(err)
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
.el-table__row {
  cursor: pointer;
}
.el-table__expand-icon>.el-icon-arrow-right:before {
  color: #f03c24;
  font-size: 16px;
}
.collapse {
  transition: all 500ms ease;
  width: 0px;
  overflow: hidden;
  display: inline-block;
}
.collapse.active {
  width: auto;
}
</style>

<style scoped>
</style>
