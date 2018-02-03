<template>
  <div>
    <div class="block">
      <span class="demonstration">{{ __('drapToLookOtherUsers') }}</span>
      <el-slider
        v-model="rank"
        :min="1"
        :max="this.threadsInfo.length + 1"
        @change="renderChart">
      </el-slider>
    </div>
    <el-switch v-model="isShowDetail"
      :active-text="__('showDetail')"
      :inactive-text="__('dontShowDetail')"></el-switch>
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
const __ = chrome.i18n.getMessage

export default {
  name: 'TotalMessages',
  components: {
    BarChart
  },
  props: [ 'threadsInfo' ],
  data: () => ({
    HEIGHT: 800,
    chartData: null,
    rank: 1,
    sliderMax: 1,
    isShowDetail: false
  }),
  async created () {
    this.renderChart()
  },
  watch: {
    isShowDetail (val) {

    }
  },
  methods: {
    renderChart (isShowDetail) {
      const startSliceIndex = Number(this.rank) - 1
      const splicedThreadsInfo = this.threadsInfo.slice(startSliceIndex, startSliceIndex + this.HEIGHT / 20)
      this.chartData = {
        labels: splicedThreadsInfo.map((info) => info.name),
        datasets: [{
          label: __('total'),
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
