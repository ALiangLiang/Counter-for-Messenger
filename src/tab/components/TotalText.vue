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
    <bar-chart
     :chart-data="chartData"
     :options="{ responsive: false, maintainAspectRatio: false }"
     :width="800"
     :height="HEIGHT">
    </bar-chart>
  </div>
</template>
<script>
import BarChart from './BarChart.js'
import fetchThreadDetail from '../lib/fetchThreadDetail.js'
const __ = chrome.i18n.getMessage

export default {
  name: 'TotalText',
  props: [ 'threadsInfo', 'token' ],
  components: {
    BarChart
  },
  data: () => ({
    HEIGHT: 800,
    loading: null,
    chartData: null,
    rank: 1,
    sliderMax: 1
  }),
  async created () {
    this.renderChart()
  },
  methods: {
    async renderChart () {
      this.loading = this.$loading({
        lock: true,
        text: __('fetchingMessages'),
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      const startSliceIndex = Number(this.rank) - 1
      const splicedThreadsInfo = this.threadsInfo.slice(startSliceIndex, startSliceIndex + this.HEIGHT / 20)
      const displayThreads = []
      let finishCount = 0
      await Promise.all(splicedThreadsInfo.map(async (info, i) => {
        // 如果已經 fetch 過訊息記錄，則略過
        if (!info.textCount) {
          await fetchThreadDetail({
            token: this.token, thread: info, $set: this.$set
          })
        }
        displayThreads[i] = {
          name: info.name,
          textCount: info.textCount
        }
        finishCount += 1
        this.loading.text = `${__('fetchingMessages')} [${finishCount}/${splicedThreadsInfo.length}]`
      }))
      this.loading.text = __('rendering')
      this.chartData = {
        labels: displayThreads.map((info) => info.name),
        datasets: [{
          label: __('total'),
          backgroundColor: '#f87979',
          data: displayThreads.map((info) => info.textCount)
        }]
      }
      this.loading.close()
    }
  }
}
</script>

<style scoped>
</style>
