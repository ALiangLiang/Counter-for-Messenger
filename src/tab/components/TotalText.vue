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
import fetchThreadMessages from './fetchThreadMessages.js'

// const __ = chrome.i18n.getMessage

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
        text: '抓取訊息中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      const startSliceIndex = Number(this.rank) - 1
      const splicedThreadsInfo = this.threadsInfo.slice(startSliceIndex, startSliceIndex + this.HEIGHT / 20)
      const displayThreads = []
      let finishCount = 0
      await Promise.all(splicedThreadsInfo.map(async (info, i) => {
        // 如果已經 fetch 過訊息記錄，則略過
        if (!info.messages) {
          const messageThread = await fetchThreadMessages({
            token: this.token, threadId: info.threadId
          })
          this.$set(info, 'messages', messageThread.messages)
        }
        const textCount = info.messages.reduce((cur, message) =>
          ((message.text) ? message.text.length : 0) + cur, 0)
        displayThreads[i] = {
          name: info.name,
          textCount
        }
        finishCount += 1
        this.loading.text = `抓取訊息中... [${finishCount}/${splicedThreadsInfo.length}]`
      }))
      this.loading.text = '渲染中...'
      this.chartData = {
        labels: displayThreads.map((info) => info.name),
        datasets: [{
          label: 'Total',
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
