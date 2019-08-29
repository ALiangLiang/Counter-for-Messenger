import { HorizontalBar, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins

export default {
  extends: HorizontalBar,

  mixins: [reactiveProp],

  props: ['chartData', 'options'],

  data () {
    return {
      canvas: this.$refs.canvas
    }
  },

  mounted () {
    this.canvas = this.$refs.canvas
    this.renderChart(this.chartData, this.options)
  },

  watch: {
    // By default, options are not reactive. So create a watcher for options.title.text
    // ref: https://github.com/apertureless/vue-chartjs/issues/106#issuecomment-299782906
    'options.title.text' () {
      this.$data._chart.destroy()
      this.renderChart(this.chartData, this.options)
    }
  }
}
