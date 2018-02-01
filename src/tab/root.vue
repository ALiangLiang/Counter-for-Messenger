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
import fetchThreadsMessageCount from './fetchThreadsMessageCount.js'

// const __ = chrome.i18n.getMessage

export default {
  components: {
    BarChart
  },
  data: () => ({
    HEIGHT: 1200,
    loading: null,
    threadsInfo: [],
    chartData: null,
    rank: 1,
    sliderMax: 1
  }),
  async created () {
    this.loading = this.$loading({
      lock: true,
      text: '抓取訊息總數中...',
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    this.threadsInfo = await fetchThreadsMessageCount()
    this.loading.text = '渲染中...'
    this.renderChart()
    this.loading.close()
  },
  methods: {
    renderChart () {
      const startSliceIndex = Number(this.rank) - 1
      const splicedThreadsInfo = this.threadsInfo.slice(startSliceIndex, startSliceIndex + this.HEIGHT / 40)
      this.chartData = {
        labels: splicedThreadsInfo.map((info) => info.name),
        datasets: [{
          label: 'Total',
          backgroundColor: '#f87979',
          data: splicedThreadsInfo.map((info) => info.messageCount)
        }]
      }
    }
  }
}
</script>
<style scoped>
</style>
