<template>
  <div class="outer-name">
    <avatar
      :images="(thread.image)
        ? [{ text: thread.threadName, src: thread.image }]
        : thread.participants.map((p) => ({ text: p.user.name, src: p.user.avatar }))"
      :allow-upload="thread.type === 'GROUP'"
      @change="onChangeThreadImage(thread, $event)" />
    <thread-name
      class="thread-name"
      :thread="thread"
      @change="((thread.type === 'GROUP')
        ? onChangeThreadName
        : onChangeNickname)(thread, $event)"></thread-name>
  </div>
</template>

<script>
import Avatar from '../Avatar.vue'
import ThreadName from './ThreadName.vue'

export default {
  name: 'DetailTemplate',

  props: [ 'thread' ],

  components: { Avatar, ThreadName },

  methods: {
    onChangeThreadName (thread, [ threadName ]) {
      this.$ga.event('Thread', 'set', 'name')
      return this.$emit('change', 'name', thread, threadName)
    },
    onChangeNickname (thread, [ nickname, otherUserId ]) {
      this.$ga.event('Thread', 'set', 'nickname')
      return this.$emit('change', 'nickname', thread, otherUserId, nickname)
    },
    onChangeThreadImage (thread, image) {
      this.$ga.event('Thread', 'set', 'image')
      return this.$emit('change', 'image', thread, image)
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

<style scoped>
.outer-name {
  display: inline-block;
  position: relative;
}
.outer-name div, span {
  display: inline-block;
  vertical-align: middle;
}
</style>
