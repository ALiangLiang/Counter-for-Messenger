<template>
  <div @click="onClick" class="thread-name" v-clickoutside="hide">
    <el-tooltip
      v-if="isGroup"
      :content="tooltip"
      placement="top-start">
      <div></div>
    </el-tooltip>
    <span v-if="!isEdit">{{ thread.threadName }}</span>
    <el-input
      v-else
      v-model="name"
      @change="onChange"
      :placeholder="placeholder"></el-input>
  </div>
</template>

<script>
import Clickoutside from 'element-ui/src/utils/clickoutside'
const __ = chrome.i18n.getMessage

export default {
  name: 'ThreadName',

  directives: { Clickoutside },

  props: ['thread'],

  data () {
    const isGroup = this.thread.type === 'GROUP'
    return {
      isEdit: false,
      isGroup,
      tooltip: this.getTooltip(),
      name: (isGroup) ? this.thread.name : this.getNickname(),
      placeholder: (isGroup) ? '替此對話命名' : this.getOtherUser().user.name
    }
  },

  mounted () {
    this.isEdit = false
  },

  watch: {
    'thread.type' () {
      const isGroup = this.thread.type === 'GROUP'
      this.isGroup = isGroup
    },
    'thread.threadName' () {
      const isGroup = this.thread.type === 'GROUP'
      this.name = (isGroup) ? this.thread.name : this.getNickname()
    },
    'thread.participants' () {
      const isGroup = this.thread.type === 'GROUP'
      this.tooltip = this.getTooltip()
      this.placeholder = (isGroup) ? '替此對話命名' : this.getOtherUser().user.name
    }
  },

  methods: {
    getTooltip () {
      return this.thread.participants.map((participant) => participant.user.name)
        .join(__('comma'))
    },
    getOtherUser () {
      return this.thread.participants.find((participant) =>
        participant.user.id !== this.thread.otherUserId)
    },
    getNickname () {
      return this.getOtherUser().user.nickname
    },
    onClick () {
      this.isEdit = true
    },
    onChange (value) {
      this.isEdit = false
      const isGroup = this.thread.type === 'GROUP'
      this.$emit('change', [value, (!isGroup) ? this.getOtherUser().user.id : undefined])
    },
    hide () {
      this.isEdit = false
    }
  }
}
</script>

<style>
.el-tooltip__popper {
  max-width: 240px;
}
</style>

<style scoped>
.el-tooltip {
  position: absolute;
  width: 100%;
  height: 100%;
}
.thread-name {
  border: 1px solid #ffffff00;
  border-radius: 4px;
  cursor: pointer;
}
.thread-name:hover {
  border-color: #c0c4ccff;
}
</style>
