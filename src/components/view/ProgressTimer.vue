<template>
  <div>
    <meter
      class="timer__meter"
      :min="startTime"
      :max="startTime + durationN"
      :value="currentTime"
    />
  </div>
</template>
<script>
export default {
  props: {
    startTime: {
      type: Number,
      default: 0,
      required: true
    },
    duration: {
      type: Number,
      default: 5000,
      required: true,
    },
    paused: {
      type: Boolean,
      default: false
    },
  },

  data: function () {
    return {
      currentTime: 0,
      updateTimeoutId: null,
      updateTimeoutInterval: 50,
    }
  },
  
  computed: {
    endTime: function () {
      return this.startTime + this.durationN
    },
    durationN: function () {
      return Number(this.duration)
    },
    remainingTime: function () {
      return Math.max(0, this.startTime + this.durationN - this.currentTime)
    },
    // 残り時間を mm:ss.xxx に変換
    remainingTimeFormatted: function () {
      const remainingTime = this.remainingTime
      const minutes = Math.floor(remainingTime / 1000 / 60).toString().padStart(2, '0')
      const seconds = Math.floor(remainingTime / 1000 % 60).toString().padStart(2, '0')
      const milliseconds = Math.floor(remainingTime % 1000).toString().padStart(3, '0')
      return `${minutes}:${seconds}.${milliseconds}`
    },
    isProgressing: function () {
      return this.timeoutId !== null
    },
  },

  watch: {
    startTime: function () {
      this.updateTimer()
    },
    paused: function () {
      this.updateTimer()
    },
    duration: function () {
      this.updateTimeoutInterval = Math.max(50, Math.min(this.durationN / 100), 1000)
      this.updateTimer()
    },
  },
  created: function () {
    if(!this.paused) {
      this.updateTimer()
    }
  },

  destroyed() {
    this.stop()
  },

  methods: {
    updateTimer() {
      if(this.paused) {
        return
      }
      this.currentTime = Date.now()
      if (this.currentTime >= this.endTime) {
        this.stop()
        this.$emit('timeout')
        if (this.repeat) {
          this.start()
        }
        return
      }
      clearTimeout(this.updateTimeoutId)
      this.updateTimeoutId = setTimeout(this.updateTimer, this.updateTimeoutInterval)
    },
    stop() {
      clearTimeout(this.updateTimeoutId)
      this.updateTimeoutId = null
      this.currentTime = 0
    },
  },
}
</script>
<style lang="scss" scoped>
.timer__meter {
  margin: 0;
  padding: 0;
  border: none;
}
</style>