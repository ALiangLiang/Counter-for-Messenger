<template>
  <transition name="el-zoom-in-top">
    <div
      class="el-color-dropdown"
      v-show="showPopper">
      <span
        v-for="(emoji, i) in emojis"
        :key="i"
        class="emoji"
        @click="choose(emoji)">{{ emoji }}</span>
    </div>
  </transition>
</template>

<script>
import Popper from 'element-ui/src/utils/vue-popper'

export default {
  name: 'EmojiChooserDropdown',
  mixins: [Popper],
  props: { emojis: { required: true } },
  mounted () {
    this.$parent.popperElm = this.popperElm = this.$el
    this.referenceElm = this.$parent.$el
  },
  methods: {
    choose (emoji) {
      this.$emit('pick', emoji)
    }
  }
}
</script>
<style>
.emoji {
  cursor: pointer;
}
</style>
