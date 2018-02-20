<template>
  <el-container>
    <el-aside width="300px">
      <el-form ref="form" label-width="0px">
        <el-form-item>
          <el-switch v-model="isShowText"
          active-color="#4bcc1f"
          inactive-color="#0084ff"
          :active-text="__('showText')"
          :inactive-text="__('showMessage')"></el-switch>
        </el-form-item>
        <el-form-item>
          <el-switch v-model="isShowDetail"
            active-color="#4bcc1f"
            inactive-color="#0084ff"
            :active-text="__('showDetail')"
            :inactive-text="__('showTotal')"></el-switch>
        </el-form-item>
      </el-form>
    </el-aside>
    <bar-chart
     :chart-data="chartData"
     :height="chartHeight"
     :options="barOption">
    </bar-chart>
    <el-aside width="100px">
      <el-slider
        v-model="rank"
        vertical
        :height="chartHeight - 18 + 'px'"
        :min="1"
        :max="this.threadsInfo.length + 1"
        @change="renderChart()">
      </el-slider>
    </el-aside>
  </el-container>
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
    chartHeight: document.documentElement.clientHeight - 130,
    loading: null,
    loadingCount: 0,
    chartData: null,
    rank: 1,
    sliderMax: 1,
    isShowText: false,
    isShowDetail: false,
    barOption: {
      responsive: false,
      maintainAspectRatio: false,
      scales: {
        xAxes: [{ stacked: true }],
        yAxes: [{ stacked: true, barPercentage: 0.7 }]
      }
    }
  }),
  async created () {
    this.$nextTick(() => window.addEventListener('resize', () =>
      (this.chartHeight = document.documentElement.clientHeight - 130)))
    this.renderChart()
  },
  watch: {
    chartHeight () { this.renderChart() },
    isShowDetail () { this.renderChart() },
    isShowText () { this.renderChart() }
  },
  methods: {
    async renderChart () {
      const startSliceIndex = Number(this.rank) - 1
      const amountOfMaxDisplay = this.chartHeight / 20
      const splicedThreads = this.threadsInfo.slice(startSliceIndex, startSliceIndex + amountOfMaxDisplay)
      if (!(!this.isShowText && !this.isShowDetail)) {
        await this.syncThreadDetail(splicedThreads)
      }
      if (!this.isShowDetail) {
        this.chartData = {
          labels: splicedThreads.map((thread) => thread.name),
          datasets: [{
            label: __('total'),
            backgroundColor: '#0083FF',
            data: splicedThreads.map((thread) => this.selectCountType(thread))
          }]
        }
      } else {
        const participantsStatus = splicedThreads
          .map((thread, i) => {
            let me = 0
            let other = 0
            thread.participants.forEach((participant) => {
              if (participant.user.id === this.selfId) me = this.selectCountType(participant)
              else other += this.selectCountType(participant)
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
      }
    },
    async syncThreadDetail (threads) {
      this.loadingCount = 0
      this.loading = this.$loading({
        lock: true,
        text: __('fetchingMessages'),
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      const errorQueue = []
      await Promise.all(threads.map(async (thread) => {
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
        this.loading.text = `${__('fetchingMessages')}[${++this.loadingCount}/${threads.length}]`
      }))
      if (errorQueue.length) {
        Message({
          type: 'error',
          message: errorQueue.join('. ')
        })
      }
      this.loading.close()
      return threads
    },
    selectCountType (object) {
      const type = (this.isShowText) ? 'textCount' : 'messageCount'
      return object[type]
    }
  }
}
</script>

<style>
</style>
