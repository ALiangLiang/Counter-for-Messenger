<template>
  <div :class="[ 'avatar-container', (images.length >= 3) ? 'multiple-avatar' : '' ]">
    <div v-for="(image, i) in images.slice(0,3)" :key="i" class="avatar">
      <img
        :alt="image.text"
        :src="image.src"
        height="32"
        width="32">
    </div>
  </div>
</template>
<script>
export default {
  name: 'Avatar',
  props: [ 'images' ]
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
</style>
