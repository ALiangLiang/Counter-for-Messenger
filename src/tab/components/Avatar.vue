<template>
  <div
    @click="onClick"
    :class="{
      'avatar-container': true,
      'multiple-avatar': (images.length >= 3)
    }">
    <div v-for="(image, i) in images.slice(0,3)" :key="i" class="avatar">
      <img
        :alt="image.text"
        :src="image.src"
        height="32"
        width="32">
      <div v-if="allowUpload" class="allow-click">
        <div class="edit-zone"><span>{{ __('edit') }}</span></div>
        <input
          class="image-upload-input"
          @change="onChange"
          ref="input"
          type="file"
          accept=".jpg,.png,.jpeg,.bmp,.tif,.tiff">
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Avatar',

  props: { 'images': Array, 'allowUpload': Boolean },

  methods: {
    onClick () {
      this.$refs.input[0].click()
    },
    onChange () {
      this.$emit('change', this.$refs.input[0].files[0])
    }
  }
}
</script>
<style scoped>
.avatar-container {
  border-radius: 50%;
  overflow: hidden;
  height: 32px;
  width: 32px;
}
.multiple-avatar>.avatar {
  float: left;
}
.multiple-avatar>.avatar:nth-child(1) {
  width: 21px;
  border-right: 1px solid #fff;
}
.multiple-avatar>.avatar:nth-child(1)>img {
  margin-left: -5px;
}
.multiple-avatar>.avatar:nth-child(n+2), .multiple-avatar>.avatar:nth-child(n+2)>img {
  width: 11px;
  height: 16px;
}
.allow-click {
  position: absolute;
  top: 0;
  height: 32px;
  width: 32px;
  border-radius: 50%;
  cursor: pointer;
  background: rgba(0, 0, 0, .4);
  opacity: 0;
}
.allow-click:hover {
  opacity: 1;
}
.edit-zone {
  color: white;
  text-align: center;
  bottom: 0;
  position: absolute;
  width: 100%;
  font-size: 12px;
}
.image-upload-input {
  display: none;
}
</style>
