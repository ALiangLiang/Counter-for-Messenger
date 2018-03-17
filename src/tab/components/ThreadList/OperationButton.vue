<template>
  <el-tooltip class="item" effect="dark" :content="text" placement="top">
    <el-button
      :disabled="disabled"
      :loading="loading"
      @click="$emit('click', $event)"
      @mouseover.native="onMouseover"
      @mouseout.native="onMouseout"
      type="text" size="small">
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

  props: [ 'icon', 'text', 'disabled', 'loading' ],

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
