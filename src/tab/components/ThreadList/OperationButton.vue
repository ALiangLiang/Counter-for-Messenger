<template>
  <el-tooltip class="item" effect="dark" :content="text" placement="top">
    <el-button
      :disabled="disabled"
      :loading="loading"
      @click="$emit('click', $event)"
      @mouseover.native="onMouseover"
      @mouseout.native="onMouseout"
      :type="type"
      :size="size"
      :round="round">
      <icon :name="icon" />
    </el-button>
  </el-tooltip>
</template>

<script>
import 'vue-awesome/icons/image'
import 'vue-awesome/icons/share-alt'
import 'vue-awesome/icons/cloud-download'
import 'vue-awesome/icons/download'
import Icon from 'vue-awesome/components/Icon'

export default {
  name: 'OperationButton',

  props: {
    icon: String,
    text: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    type: { type: String, default: 'text' },
    size: { type: String, default: 'small' },
    round: { type: Boolean, default: false }
  },

  data () {
    return {
      show: false
    }
  },

  components: { Icon },

  methods: {
    onMouseover () {
      this.show = true
    },
    onMouseout () {
      this.show = false
    }
  }
}
</script>
