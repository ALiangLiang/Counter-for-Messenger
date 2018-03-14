<template>
  <el-button
    :disabled="disabled"
    :loading="loading"
    @click="$emit('click', $event)"
    @mouseover.native="onMouseover"
    @mouseout.native="onMouseout"
    type="text" size="small">
    <icon :name="icon" />
    <div :class="{ collapse: true, active: !show }">{{ text }}</div>
  </el-button>
</template>

<script>
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

<style scoped>
.collapse {
  transition: all 500ms ease;
  width: 120px;
  display: inline-block;
  opacity: 1;
}
.collapse.active {
  overflow: hidden;
  width: 0px;
  opacity: 0;
}
</style>
