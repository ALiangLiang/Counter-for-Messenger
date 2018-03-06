<template>
  <div @click="onClick" class="thread-name">
    <el-tooltip
      v-if="useTooltip"
      :content="tooltip"
      placement="top-start">
      <div></div>
    </el-tooltip>
    <span v-if="!isEdit">{{ name }}</span>
    <el-input v-else v-model="threadName" @change="onChangeThreadName" placeholder="Thread Name"></el-input>
  </div>
</template>

<script>
export default {
  name: 'ThreadName',

  props: { name: { required: true }, tooltip: String },

  data () {
    return {
      isEdit: false,
      threadName: this.name,
      useTooltip: !!this.tooltip
    }
  },

  methods: {
    onClick () {
      this.isEdit = true
    },
    onChangeThreadName (newThreadName) {
      this.isEdit = false
      this.$emit('change', newThreadName)
    }
  }
}
</script>
<style scoped>
.thread-name {
  transition: border-color .2s cubic-bezier(.645,.045,.355,1);
  border: 1px solid #ffffff00;
  border-radius: 4px;
  cursor: pointer;
}
.thread-name:hover {
  border-color: #c0c4ccff;
}
</style>
