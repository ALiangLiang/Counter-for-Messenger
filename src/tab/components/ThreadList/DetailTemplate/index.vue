<template>
  <el-form :inline="true" class="thread-form-inline">
    <el-form-item :label="__('emoji') + __('colon')">
      <chooser
        type="emoji"
        @change="onChangeEmoji(thread, $event)"
        v-model="thread.emoji"></chooser>
    </el-form-item>
    <el-form-item :label="__('color') + __('colon')">
      <chooser
        type="color"
        @change="onChangeColor(thread, $event)"
        v-model="thread.color"></chooser>
    </el-form-item>
    <el-form-item :label="__('muteUntil') + __('colon')">
      <mute-until
        v-model="thread.muteUntil"
        @change="onMuteThread(thread, $event)" />
    </el-form-item>
  </el-form>
</template>

<script>
import Chooser from './Chooser.vue'
import MuteUntil from './MuteUntil.vue'

export default {
  name: 'DetailTemplate',

  props: [ 'thread' ],

  components: { Chooser, MuteUntil },

  methods: {
    onMuteThread (thread, muteSeconds) {
      this.$ga.event('Thread', 'set', 'mute', muteSeconds)
      return this.$emit('change', 'mute', thread, muteSeconds)
    },
    onChangeColor (thread, color) {
      this.$ga.event('Thread', 'set', 'color')
      return this.$emit('change', 'color', thread, color)
    },
    onChangeEmoji (thread, emoji) {
      this.$ga.event('Thread', 'set', 'emoji')
      return this.$emit('change', 'emoji', thread, emoji)
    }
  }
}
</script>

<style scoped>
.thread-form-inline>.el-form-item {
  margin-bottom: 0;
}
.thread-form-inline>div:nth-child(n+2) {
  border-left: 1px solid #e6e6e6;
  padding-left: 12px;
}
</style>
