<template>
  <el-dialog
    title="Sharing"
    :visible.sync="isVisibled"
    customClass="sharing-dialog"
    class="sharing-dialog-wrapper">
    <div class="sharing-button-bar">
      <el-button type="primary" @click="share">
        <icon name="facebook-f"></icon>
        {{ __('shareOnFacebook') }}
      </el-button>
      <el-button type="primary" @click="download">
        <icon name="download"></icon>
        {{ __('download') }}
      </el-button>
    </div>
    <img :src="src" />
  </el-dialog>
</template>

<script>
import 'vue-awesome/icons/facebook-f'
import 'vue-awesome/icons/download'
import Icon from 'vue-awesome/components/Icon'
import shareOnFb from '../lib/shareOnFb.js'

export default {
  name: 'SharingDialog',

  components: { Icon },

  props: ['jar'],

  data () {
    return {
      canvas: null,
      cropeedCanvas: null,
      isVisibled: false,
      src: (this.canvas) ? this.canvas.toDataURL() : null
    }
  },

  watch: {
    canvas () {
      const croppedCanvas = document.createElement('canvas')
      croppedCanvas.width = 1200
      croppedCanvas.height = 630
      croppedCanvas.getContext('2d').drawImage(this.canvas, 0, 0)
      this.croppedCanvas = croppedCanvas
      this.src = this.croppedCanvas.toDataURL()
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
    async share () {
      if (this.canvas) { return shareOnFb(this.croppedCanvas, this.jar) }
    },
    async download () {
      this.$ga.event('SharingImage', 'download')

      try {
        const blob = await new Promise((resolve, reject) => this.croppedCanvas.toBlob(resolve))
        chrome.downloads.download({
          filename: 'share.png',
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
