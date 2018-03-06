<template>
  <div class="color-chooser" v-clickoutside="hide">
    <div
      class="color-chooser__trigger"
      :style="{ 'background-color': value || '#0084ff' }"
      @click="handleTrigger"></div>
    <color-chooser-dropdown
      class="color-chooser__panel"
      ref="dropdown"
      v-model="showChooser"
      @pick="confirmValue"
      :colors="colors">
    </color-chooser-dropdown>
  </div>
</template>

<script>
import ColorChooserDropdown from './ColorChooserDropdown.vue'
import { COLORS } from '../lib/changeThreadColor.js'
import Clickoutside from 'element-ui/src/utils/clickoutside'

export default {
  name: 'ColorChooser',

  components: { ColorChooserDropdown },

  directives: { Clickoutside },

  props: { value: String },

  watch: {
    value (val) {
      if (!val) {
        this.showPanelColor = false
      } else if (val && val !== this.color.value) {
        this.color.fromString(val)
      }
    }
  },

  methods: {
    handleTrigger () {
      this.showChooser = !this.showChooser
    },
    confirmValue (value) {
      value = (value && value.toLowerCase() === '#0084ff') ? null : value
      this.$emit('input', value)
      this.$emit('change', value)
      this.showChooser = false
    },
    hide () {
      this.showChooser = false
    }
  },

  mounted () {
    const value = this.value
    if (value) {
      this.color.fromString(value)
    }
    this.popperElm = this.$refs.dropdown.$el
  },

  data () {
    return {
      colors: COLORS,
      showChooser: false,
      displayedColor: false
    }
  }
}
</script>

<style>
.color-chooser {
  display: inline-block;
  border: 1px solid #e6e6e6;
}
.color-chooser__trigger {
  width: 14px;
  height: 14px;
}
.color-chooser__panel {
  position: absolute;
  padding: 6px;
  box-sizing: content-box;
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
}
</style>
