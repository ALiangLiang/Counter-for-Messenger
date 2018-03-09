<template>
  <transition name="el-zoom-in-top">
    <div
      class="el-color-dropdown"
      v-show="showPopper">
      <div
        v-for="(name, hex) in colors"
        :key="hex"
        class="color-circle"
        :style="{ 'background-color': hex }"
        @click="choose(hex)"></div>
    </div>
  </transition>
</template>

<script>
import Popper from 'element-ui/src/utils/vue-popper'

export default {
  name: 'ColorChooserDropdown',
  mixins: [Popper],
  props: { colors: { required: true } },
  mounted () {
    this.$parent.popperElm = this.popperElm = this.$el
    this.referenceElm = this.$parent.$el
  },
  methods: {
    choose (hex) {
      this.$emit('pick', hex)
    }
  }
}
</script>
<style>
.color-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  display: inline-block;
  margin: 4px;
}
</style>
