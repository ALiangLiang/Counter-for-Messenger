<template>
  <div class="chooser" v-clickoutside="hide">
    <div v-if="type.toLowerCase() === 'emoji'">
      <div
        class="chooser__trigger emoji-chooser__trigger"
        @click="handleTrigger">{{ value || '👍' }}</div>
      <emoji-chooser-dropdown
        class="chooser__panel"
        ref="dropdown"
        v-model="showChooser"
        @pick="confirmValue"
        :emojis="emojis">
      </emoji-chooser-dropdown>
    </div>
    <div v-if="type.toLowerCase() === 'color'" class="chooser__inner">
      <div
        class="chooser__trigger color-chooser__trigger"
        :style="{ 'background-color': value || '#0084ff' }"
        @click="handleTrigger">
        {{ value || 'Default' }}
      </div>
      <color-chooser-dropdown
        v-if="type.toLowerCase() === 'color'"
        class="chooser__panel"
        ref="dropdown"
        v-model="showChooser"
        @pick="confirmValue"
        :colors="colors">
      </color-chooser-dropdown>
    </div>
  </div>
</template>

<script>
import EmojiChooserDropdown from './EmojiChooserDropdown.vue'
import ColorChooserDropdown from './ColorChooserDropdown.vue'
import { EMOJIS, COLORS } from '../lib/changeThreadSetting.js'
import Clickoutside from 'element-ui/src/utils/clickoutside'

export default {
  name: 'Chooser',

  components: { EmojiChooserDropdown, ColorChooserDropdown },

  directives: { Clickoutside },

  props: { value: String, type: String },

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
      emojis: EMOJIS,
      colors: COLORS,
      showChooser: false,
      displayedColor: false
    }
  }
}
</script>

<style>
.chooser {
  display: inline-block;
  transition: border-color .2s cubic-bezier(.645,.045,.355,1);
  border: 1px solid #e6e6e6;
  border-radius: 4px;
}
.chooser:hover {
  border-color: #c0c4cc;
}
.chooser__trigger {
  border-radius: 4px;
  cursor: pointer;
}
.emoji-chooser__trigger {
  font-size: 18px;
  text-align: center;
  width: 40px;
  height: 40px;
}
.color-chooser__trigger {
  padding: 0 10px;
  color: white;
}
.chooser__panel {
  position: absolute;
  padding: 6px;
  box-sizing: content-box;
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
}
</style>
