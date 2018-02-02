<template>
  <div>
    <div class="block">
      <span class="demonstration">滑動以查看其他排名</span>
      <el-slider
        v-model="rank"
        :min="1"
        :max="this.threadsInfo.length + 1"
        @change="renderChart">
      </el-slider>
    </div>
    <bar-chart
     :chart-data="chartData"
     :options="{ responsive: false, maintainAspectRatio: false }"
     :width="800"
     :height="HEIGHT" >
    </bar-chart>
  </div>
</template>
<script>
import BarChart from './BarChart.js'

// const __ = chrome.i18n.getMessage

export default {
  name: 'TotalMessages',
  components: {
    BarChart
  },
  props: [ 'threadsInfo' ],
  data: () => ({
    HEIGHT: 1200,
    chartData: null,
    rank: 1,
    sliderMax: 1
  }),
  async created () {
    this.renderChart()
  },
  methods: {
    renderChart () {
      const startSliceIndex = Number(this.rank) - 1
      const splicedThreadsInfo = this.threadsInfo.slice(startSliceIndex, startSliceIndex + this.HEIGHT / 40)
      this.chartData = {
        labels: splicedThreadsInfo.map((info) => info.name),
        datasets: [{
          label: 'Total',
          backgroundColor: '#0083FF',
          data: splicedThreadsInfo.map((info) => info.messageCount)
        }]
      }
    }
  }
}
</script>

<style scoped>
</style>
