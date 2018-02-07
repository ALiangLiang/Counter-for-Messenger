<template>
  <div>
    <el-form  label-width="120px">
      <el-form-item label="Cache Messages">
        <el-switch
          v-model="isCacheMessages"
          :disabled="true"
          active-text="Cache"
          inactive-text="No cache">
        </el-switch>
        <p>
          Cache can improve the performance of next time thread import.
          If you're using public device, don't cache them.
          <br>Advantages: Improve performance. Avoid your Messenger been temporarily banned when you download a lot of threads.
          <br>Disadvantages: Your messages save in your device so somebody can view them if they can access your device.
        </p>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import storage from '../ext/storage.js'

export default {
  data: () => {
    const canUseIndexeddb = !!(window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB)
    if (!canUseIndexeddb) storage.set('isCacheMessages', false)
    const isCacheMessages = storage.get('isCacheMessages', true)
    return {
      isCacheMessages,
      canUseIndexeddb
    }
  },
  watch: {
    isCacheMessages (val) {
      if (this.canUseIndexeddb) storage.set('isCacheMessages', val)
    }
  },
  computed: { },
  created () { },
  mounted () { },
  methods: { }
}
</script>
<style>
</style>
