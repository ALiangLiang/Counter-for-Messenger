<template>
  <div class="chooser">
    <el-date-picker
      v-model="until"
      type="datetime"
      :editable="false"
      value-format="timestamp"
      :placeholder="text"
      :picker-options="pickerOptions"
      @change="confirmValue">
    </el-date-picker>
  </div>
</template>

<script>
const __ = chrome.i18n.getMessage

export default {
  name: 'MuteUntil',

  props: { value: Number },

  data () {
    const text = this.makeText()
    const ce = this.chortcutEvent
    return {
      text,
      until: '',
      pickerOptions: {
        disabledDate (date) {
          const today = new Date()
          today.setHours(0)
          today.setMinutes(0)
          today.setSeconds(0)
          today.setMilliseconds(0)
          return date < today || date > (today.getTime() + 30 * 86400000)
        },
        shortcuts: [
          { text: __('unmute'), onClick: (picker) => ce(picker, 0) },
          { text: '30 ' + __('minutes'), onClick: (picker) => ce(picker, 30) },
          { text: '1 ' + __('hour'), onClick: (picker) => ce(picker, 60) },
          { text: '8 ' + __('hours'), onClick: (picker) => ce(picker, 60 * 8) },
          { text: '1 ' + __('day'), onClick: (picker) => ce(picker, 60 * 24) },
          { text: '1 ' + __('week'), onClick: (picker) => ce(picker, 60 * 24 * 7) },
          { text: '1 ' + __('month'), onClick: (picker) => ce(picker, 60 * 24 * 30) },
          { text: __('always'), onClick: (picker) => ce(picker, Infinity) }
        ]
      }
    }
  },

  methods: {
    makeText (muteSeconds) {
      const value = (muteSeconds) ? (muteSeconds * 1000 + new Date()) : this.value
      let text = ''
      if (value === Infinity) text = __('muteForever')
      else if (value) text = new Date(value * 1000).toLocaleString()
      return text
    },
    confirmValue (pickTimestamp) {
      const addedSeconds = Math.round((pickTimestamp - new Date()) / 1000)
      let muteSeconds = addedSeconds
      if (addedSeconds < 0) {
        this.until = null
        muteSeconds = 0
      } else if (addedSeconds === Infinity) muteSeconds = -1 // mute forever, send -1 back.
      // maximum of mute time range is 30 days (2592000 srconds).
      else if (addedSeconds > 30 * 86400) muteSeconds = 30 * 86400

      this.$emit('change', muteSeconds)
      this.text = this.makeText(addedSeconds)
      return addedSeconds
    },
    chortcutEvent (picker, addedMins) {
      function addMinutes (mins) {
        const date = new Date()
        date.setTime(date.getTime() + 60 * 1000 * mins)
        return date
      }

      if (addedMins !== Infinity) picker.$emit('pick', addMinutes(addedMins))
      else picker.$emit('pick', addedMins)
    }
  }
}
</script>
