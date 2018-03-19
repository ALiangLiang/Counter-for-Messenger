<template>
  <div>
    <div
      :class="{
        'operation-bar': true,
        'show-operation-buttons': selectedThreads.length
      }"
      style="padding: 20px">
      <el-pagination
        v-if="!selectedThreads.length"
        @size-change="(val) => (threadsPerPage = val)"
        :current-page.sync="currentPage"
        :page-sizes="[5, 10, 20, 40]"
        :page-size="10"
        layout="total, sizes, prev, pager, next, jumper"
        :total="tableData.length">
      </el-pagination>
      <div
        v-if="selectedThreads.length">
        <el-button type="primary" class="operation-bar-button" size="small">Clear</el-button>
        Already select {{ selectedThreads.length }} threads
        <div class="operation-bar-float-right">
          <operation-button
            @click=""
            type="primary"
            icon="cloud-download"
            :text="__('importMessageHistory')"
            size="mini"
            class="operation-bar-button"
            round>
          </operation-button>
          <operation-button
            @click=""
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
            icon="image"
            :text="__('generateSharingImage')">
          </operation-button>
          <operation-button
            @click="shareOnFb(row, $index)"
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
    <sharing-dialog ref="sharingDialog" />
  </div>
</template>

<script>
import 'vue-awesome/icons/cloud-download'
import 'vue-awesome/icons/download'
import Icon from 'vue-awesome/components/Icon'
import _get from 'lodash/get'
import {
  toQuerystring,
  uploadImage,
  getAvatar,
  getTextWidth,
  adjustTextSize
} from '../../lib/util.js'
import downloadMessages from '../../lib/downloadMessages.js'
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
} from '../../lib/changeThreadSetting.js'
import { fb } from '../../../../core/.env.js'
const __ = chrome.i18n.getMessage

export default {
  name: 'ThreadList',

  props: [ 'value', 'keyword', 'page', 'ctx' ],

  components: { Icon, DetailTemplate, NameTemplate, OperationButton, SharingDialog },

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
      return this.selectedThreads.map((thread) => thread.loadDetail(ctx, this.$set))
    },
    async fetchMessages (thread) {
      this.$ga.event('ThreadDetails', 'fetch', 'length', 1)

      const ctx = { db: this.ctx.db, jar: this.ctx.jar }
      return thread.loadDetail(ctx, this.$set)
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

      this.$refs.sharingDialog.canvas = await this.generateCanvas(thread, index, imageSize)
      this.$refs.sharingDialog.show()
    },
    async generateCanvas (thread, index, imageSize) {
      function loadImage (src) {
        const img = new Image()
        img.crossOrigin = 'Anonymous'
        img.src = src
        return new Promise((resolve, reject) => (img.onload = () => resolve(img)))
      }

      try {
        const paddingTop = 70
        const avatarWidth = 250
        const userNameSize = 40
        const padding = [ 20, 25 ]
        const lineHeight = 15
        const avatarPaddingAside = 70
        const avatarPos = [
          [ avatarPaddingAside, paddingTop ],
          [ imageSize.width - avatarWidth - avatarPaddingAside, paddingTop ]
        ]
        const fontSet = 'Verdana, Microsoft JhengHei'
        let textOffsetY = paddingTop + 40

        // draw sharing image
        const canvas = document.createElement('canvas')
        canvas.width = imageSize.width
        canvas.height = imageSize.height
        const ctx = canvas.getContext('2d')

        // paste background
        ctx.fillStyle = 'rgb(0, 131, 255, 0.8)'
        ctx.fillRect(0, 0, imageSize.width, imageSize.height)

        // set logo
        const logoText = `${__('extName')} (${__('unofficial')})`
        const logoTextSize = 40
        const logoTextPosY = canvas.height - padding[1]
        const generatedByPostfixPosX = canvas.width - padding[0]
        const generatedByFontSet = `30px ${fontSet}`
        const logoTextRightPosX = generatedByPostfixPosX -
          ((__('generatedByPostfix')) ? getTextWidth(__('generatedByPostfix'), generatedByFontSet) + 20 : 0)
        ctx.font = `${logoTextSize}px ${fontSet}`
        ctx.fillStyle = '#fff'
        ctx.textAlign = 'right'
        ctx.fillText(logoText, logoTextRightPosX, logoTextPosY)
        const logoWidth = 50
        const logoPos = [
          logoTextRightPosX - getTextWidth(logoText, ctx.font) - logoWidth - 15,
          canvas.height - logoWidth + (logoWidth - logoTextSize) / 2 - padding[1] + 5
        ]
        ctx.drawImage(await loadImage('../icons/128.png'), logoPos[0], logoPos[1], logoWidth, logoWidth)
        // write "generate by"
        ctx.font = generatedByFontSet
        ctx.fillText(__('generatedByPrefix'), logoPos[0] - 20, logoTextPosY)
        ctx.fillText(__('generatedByPostfix'), generatedByPostfixPosX, logoTextPosY)

        const users = thread.participants
          .map((participant) => participant.user)
          .sort((user) => (user.id === this.ctx.selfId) ? -1 : 0)
        const images = await Promise.all(
          users.map(async (user) => loadImage(await getAvatar(this.ctx.jar, user))))
        const [ leftUser, rightUser ] = users

        // write user name
        ctx.fillStyle = '#fff'
        ctx.textAlign = 'center'
        users.forEach((user, i) => {
          ctx.font = `${adjustTextSize(user.name, userNameSize, avatarWidth, fontSet)}px ${fontSet}`
          ctx.fillText(user.name
            , avatarPos[i][0] + avatarWidth / 2
            , avatarPos[i][1] + avatarWidth + userNameSize + 30)
        })

        // write message count
        // "They have"
        ctx.font = `60px ${fontSet}`
        ctx.fillStyle = '#fff'
        ctx.textAlign = 'center'
        ctx.fillText(__('countPrefix'), imageSize.width / 2, textOffsetY += 60 + lineHeight)
        // message count background
        const barHeight = 120
        ctx.fillStyle = '#fff'
        ctx.fillRect(0, textOffsetY + lineHeight * 2, imageSize.width, barHeight)
        // message count text
        ctx.fillStyle = 'rgb(0, 131, 255)'
        ctx.font = `${barHeight}px ${fontSet}`
        ctx.fillText(thread.messageCount, imageSize.width / 2, textOffsetY += barHeight + lineHeight)
        // "messages!"
        ctx.fillStyle = '#fff'
        ctx.font = `60px ${fontSet}`
        ctx.fillText(__('countPostfix'), imageSize.width / 2, textOffsetY += 60 + lineHeight)
        // rank
        const rankText = __('rank', [ leftUser.name, index + 1, rightUser.name ])
        ctx.font = `bold ${adjustTextSize(rankText, 60, canvas.width - 100, fontSet)}px ${fontSet}`
        ctx.fillText(rankText, imageSize.width / 2, textOffsetY += 60 + 50)

        // placed avatars
        images.forEach((image, i) => {
          const outerBorderWidth = 2
          const borderWidth = 8
          // draw black outter border
          ctx.fillStyle = 'rgba(0, 0, 0, .4)'
          ctx.fillRect(
            avatarPos[i][0] - borderWidth - outerBorderWidth,
            avatarPos[i][1] - borderWidth - outerBorderWidth,
            avatarWidth + borderWidth * 2 + outerBorderWidth * 2,
            avatarWidth + borderWidth * 2 + outerBorderWidth * 2)
          // draw white inner border
          ctx.fillStyle = '#fff'
          ctx.fillRect(
            avatarPos[i][0] - borderWidth,
            avatarPos[i][1] - borderWidth,
            avatarWidth + borderWidth * 2,
            avatarWidth + borderWidth * 2)
          // paste avatar
          ctx.drawImage(image, avatarPos[i][0], avatarPos[i][1], avatarWidth, avatarWidth)
        })

        return canvas
      } catch (err) {
        console.error(err)
      }
    },
    async shareOnFb (thread, index) {
      /** @see https://developers.facebook.com/docs/sharing/best-practices/#images **/
      const imageSize = { width: 1200, height: 630 }

      try {
        const canvas = await this.generateCanvas(thread, index, imageSize)

        // output blob
        const blob = await new Promise((resolve, reject) => canvas.toBlob(resolve))

        // upload image to fb
        const metadata = (await uploadImage(this.ctx.jar, blob)).payload.metadata[0]

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
</style>
