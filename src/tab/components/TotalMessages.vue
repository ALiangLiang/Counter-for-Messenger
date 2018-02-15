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
      active-color="#4bcc1f"
      inactive-color="#0084ff"
      :active-text="__('showDetail')"
      :inactive-text="__('showTotal')"></el-switch>
    <bar-chart
     :chart-data="chartData"
     :options="barOption"
     :width="800"
     :height="HEIGHT" >
    </bar-chart>
  </div>
</template>
<script>
import { Message } from 'element-ui'
import BarChart from './BarChart.js'
import fetchThreadDetail from '../lib/fetchThreadDetail.js'
const __ = chrome.i18n.getMessage

export default {
  name: 'TotalMessages',
  components: {
    BarChart
  },
  props: [ 'threadsInfo', 'selfId', 'token', 'db' ],
  data: () => ({
    HEIGHT: 800,
    loading: null,
    loadingCount: 0,
    chartData: null,
    rank: 1,
    sliderMax: 1,
    isShowDetail: false,
    barOption: { responsive: false,
      maintainAspectRatio: false,
      scales: {
        xAxes: [{
          stacked: true
        }],
        yAxes: [{
          stacked: true
        }]
      }
    }
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
    async renderChart (isShowDetail = this.isShowDetail) {
      const startSliceIndex = Number(this.rank) - 1
      const amountOfMaxDisplay = this.HEIGHT / 20
      const splicedThreads = this.threadsInfo.slice(startSliceIndex, startSliceIndex + amountOfMaxDisplay)
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
        this.loadingCount = 0
        this.loading = this.$loading({
          lock: true,
          text: __('fetchingMessages'),
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })

        const errorQueue = []
        await Promise.all(splicedThreads.map(async (thread) => {
          if (thread.textCount) return
          if (!thread.messages) {
            const cachedThread = await this.db.get(thread.id)
            if (cachedThread && cachedThread.messages) return
            thread.isLoading = true
            try {
              const result = await fetchThreadDetail({
                token: this.token, thread, $set: this.$set
              })
              thread.needUpdate = false
              thread.analyzeMessages(result)
              await this.db.put({ id: thread.id, messages: result })
            } catch (err) {
              console.error(err)
              if (errorQueue.indexOf(err.message) === -1) {
                errorQueue.push(err.message)
              }
            }
            thread.isLoading = false
          } else {
            thread.analyzeMessages()
          }
          this.loading.text = `${__('fetchingMessages')}[${++this.loadingCount}/${amountOfMaxDisplay}]`
        }))
        if (errorQueue.length) {
          Message({
            type: 'error',
            message: errorQueue.join('. ')
          })
        }

        this.loading.text = __('rendering')
        const participantsStatus = splicedThreads
          .map((thread, i) => {
            let me = 0
            let other = 0
            thread.participants.forEach((participant) => {
              if (participant.user.id === this.selfId) me = participant.messageCount
              else other += participant.messageCount
            })
            return [me, other]
          })
          .reduce((cur, row) => {
            cur[0].push(row[0])
            cur[1].push(row[1])
            return cur
          }, [[], []])
        const datasets = participantsStatus.map((status, i) => {
          return {
            label: (i === 0) ? 'Me' : 'Other',
            backgroundColor: (i === 0) ? '#4BCC1F' : '#F03C24',
            data: status
          }
        })
        this.chartData = {
          labels: splicedThreads.map((info) => info.name),
          datasets
        }

        this.loading.close()
      }
    }
  }
}
</script>

<style scoped>
</style>
