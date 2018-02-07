<template>
  <div>
    <div class="block">
      <span class="demonstration">{{ __('drapToLookOtherUsers') }}</span>
      <el-slider
        v-model="rank"
        :min="1"
        :max="this.threadsInfo.length + 1"
        @change="renderChart()">
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
      this.renderChart(val)
    }
  },
  methods: {
    renderChart (isShowDetail = this.isShowDetail) {
      const startSliceIndex = Number(this.rank) - 1
      const splicedThreads = this.threadsInfo.slice(startSliceIndex, startSliceIndex + this.HEIGHT / 20)
      if (!isShowDetail) {
        this.chartData = {
          labels: splicedThreads.map((info) => info.name),
          datasets: [{
            label: __('total'),
            backgroundColor: '#0083FF',
            data: splicedThreads.map((info) => info.messageCount)
          }]
        }
      } else {
        // const allParticipants = splicedThreads.reduce((cur, thread) => {
        //   if (!cur.find((participant) => participant.id === thread.id)) {
        //   cur.push(thread.participants)
        //   }
        // }, [])
        // this.chartData = {
        //   labels: splicedThreads.map((info) => info.name),
        //   datasets: splicedThreads.participants.map((participant) => ({
        //     label: participant.name,
        //     data: splicedThreads.map((thread) => )
        //   }))
        //
        //   [{
        //     label: __('total'),
        //     backgroundColor: '#0083FF',
        //     data: splicedThreads.map((info) => info.messageCount)
        //   }]
        // }
      }
    }
  }
}
</script>

<style scoped>
</style>
