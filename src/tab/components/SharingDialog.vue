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
      <el-button type="primary" @click="download">
        <icon name="download"></icon>
        Download
      </el-button>
    </div>
    <img :src="src" />
  </el-dialog>
</template>

<script>
import 'vue-awesome/icons/facebook-f'
import 'vue-awesome/icons/download'
import Icon from 'vue-awesome/components/Icon'

export default {
  name: 'SharingDialog',

  components: { Icon },

  data () {
    return {
      canvas: null,
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
    },
    async download () {
      this.$ga.event('SharingImage', 'download')

      try {
        const blob = await new Promise((resolve, reject) => this.canvas.toBlob(resolve))
        chrome.downloads.download({
          filename: 'achievement.png',
          url: URL.createObjectURL(blob)
        })
      } catch (err) {
        console.error(err)
      }
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
