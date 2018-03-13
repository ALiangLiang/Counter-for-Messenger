<template>
  <el-dialog
    title="Sharing"
    :visible.sync="isVisibled"
    customClass="sharing-dialog"
    class="sharing-dialog-wrapper">
    <div class="sharing-button-bar">
      <el-button type="primary">
        <icon name="facebook-f"></icon>
        Share to Facebook
      </el-button>
    </div>
    <img :src="src" />
  </el-dialog>
</template>

<script>
import 'vue-awesome/icons/facebook-f'
import Icon from 'vue-awesome/components/Icon'

export default {
  name: 'SharingDialog',

  components: { Icon },

  props: [ 'canvas' ],

  data () {
    return {
      isVisibled: false,
      src: (this.canvas) ? this.canvas.toDataURL() : null
    }
  },

  watch: {
    canvas () {
      this.src = (this.canvas) ? this.canvas.toDataURL() : null
    }
  },

  methods: {
    show () {
      this.isVisibled = true
    },
    hide () {
      this.isVisibled = false
    },
    toggle () {
      this.isVisibled = !this.isVisibled
    }
  }
}
</script>

<style>
.sharing-dialog {
  width: auto;
  display: inline-block;
}
</style>

<style scoped>
.sharing-button-bar {
  margin-bottom: 20px;
}
.sharing-dialog-wrapper {
  text-align: center;
}
img {
  max-width: 1200px;
  max-height: 630px;
  width: auto;
  height: auto;
}
</style>
