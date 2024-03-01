<template>
  <div class="content-area">
    <section class="content-box">
      <div class="sensor-select-wrap">
        <div>
          <select
            v-model="graphKind"
            :disabled="!connected"
          >
            <option value="" />
            <option value="明るさ[lx]">
              明るさ[lx]
            </option>
            <option value="気温[℃]">
              気温[℃]
            </option>
            <option value="気圧[hPa]">
              気圧[hPa]
            </option>
            <option value="湿度[%]">
              湿度[%]
            </option>
            <option value="加速度(絶対値)[m/s^2]">
              加速度(絶対値)[m/s^2]
            </option>
            <option value="加速度(X)[m/s^2]">
              加速度(X)[m/s^2]
            </option>
            <option value="加速度(Y)[m/s^2]">
              加速度(Y)[m/s^2]
            </option>
            <option value="加速度(Z)[m/s^2]">
              加速度(Z)[m/s^2]
            </option>
            <option value="加速度(ロール)[°]">
              加速度(ロール)[°]
            </option>
            <option value="加速度(ピッチ)[°]">
              加速度(ピッチ)[°]
            </option>
            <option value="距離(レーザー)[cm]">
              距離(レーザー)[cm]
            </option>
            <option value="距離(超音波A)[cm]">
              距離(超音波A)[cm]
            </option>
            <option value="距離(超音波B)[cm]">
              距離(超音波B)[cm]
            </option>
            <option
              v-if="graphKindSub !== '水温(デジタルA1)[℃]' && graphKindSub !== '水温(デジタルB1)[℃]'"
              value="水温(デジタルA1)[℃]"
            >
              水温(デジタルA1)[℃]
            </option>
            <option
              v-if="graphKindSub !== '水温(デジタルA1)[℃]' && graphKindSub !== '水温(デジタルB1)[℃]'"
              value="水温(デジタルB1)[℃]"
            >
              水温(デジタルB1)[℃]
            </option>

            <option value="酸素濃度[%]">
              酸素濃度[%]
            </option>
            <option value="二酸化炭素濃度[ppm]">
              二酸化炭素濃度[ppm]
            </option>

            <option value="アナログA1">
              アナログA1
            </option>
            <option value="アナログA2">
              アナログA2
            </option>
            <option value="アナログB1">
              アナログB1
            </option>
            <option value="アナログB2">
              アナログB2
            </option>
            <option value="デジタルA1">
              デジタルA1
            </option>
            <option value="デジタルA2">
              デジタルA2
            </option>
            <option value="デジタルB1">
              デジタルB1
            </option>
            <option value="デジタルB2">
              デジタルB2
            </option>
          </select>
          <input
            class="last-main-value"
            type="text"
            :value="lastMainValue"
            readonly
          >
        </div>
        <div>
          <select
            v-model="interval"
            :disabled="!connected"
          >
            <option value="1000">
              1秒
            </option>
            <option value="3000">
              3秒
            </option>
            <option value="5000">
              5秒
            </option>
            <option value="10000">
              10秒
            </option>
            <option value="30000">
              30秒
            </option>
            <option value="60000">
              1分
            </option>
            <option value="180000">
              3分
            </option>
            <option value="300000">
              5分
            </option>
            <option value="600000">
              10分
            </option>
            <!-- <option value="1800000">
              30分
            </option> -->
          </select>
          <ProgressTimer
            ref="progressTimer"
            class="progress-timer"
            :duration="milliSeconds"
            :paused="!inProgress"
            :start-time="renderTimerStartTime"
          />
        </div>
        <div>
          <input
            class="last-sub-value"
            type="text"
            :value="lastSubValue"
            readonly
          >
          <select
            v-model="graphKindSub"
            :disabled="!connected"
          >
            <option value="" />
            <option value="明るさ[lx]">
              明るさ[lx]
            </option>
            <option value="気温[℃]">
              気温[℃]
            </option>
            <option value="気圧[hPa]">
              気圧[hPa]
            </option>
            <option value="湿度[%]">
              湿度[%]
            </option>
            <option value="加速度(絶対値)[m/s^2]">
              加速度(絶対値)[m/s^2]
            </option>
            <option value="加速度(X)[m/s^2]">
              加速度(X)[m/s^2]
            </option>
            <option value="加速度(Y)[m/s^2]">
              加速度(Y)[m/s^2]
            </option>
            <option value="加速度(Z)[m/s^2]">
              加速度(Z)[m/s^2]
            </option>
            <option value="加速度(ロール)[°]">
              加速度(ロール)[°]
            </option>
            <option value="加速度(ピッチ)[°]">
              加速度(ピッチ)[°]
            </option>
            <option value="距離(レーザー)[cm]">
              距離(レーザー)[cm]
            </option>
            <option value="距離(超音波A)[cm]">
              距離(超音波A)[cm]
            </option>
            <option value="距離(超音波B)[cm]">
              距離(超音波B)[cm]
            </option>
            <option
              v-if="graphKind !== '水温(デジタルA1)[℃]' && graphKind !== '水温(デジタルB1)[℃]'"
              value="水温(デジタルA1)[℃]"
            >
              水温(デジタルA1)[℃]
            </option>
            <option
              v-if="graphKind !== '水温(デジタルA1)[℃]' && graphKind !== '水温(デジタルB1)[℃]'"
              value="水温(デジタルB1)[℃]"
            >
              水温(デジタルB1)[℃]
            </option>

            <option value="酸素濃度[%]">
              酸素濃度[%]
            </option>
            <option value="二酸化炭素濃度[ppm]">
              二酸化炭素濃度[ppm]
            </option>

            <option value="アナログA1">
              アナログA1
            </option>
            <option value="アナログA2">
              アナログA2
            </option>
            <option value="アナログB1">
              アナログB1
            </option>
            <option value="アナログB2">
              アナログB2
            </option>
            <option value="デジタルA1">
              デジタルA1
            </option>
            <option value="デジタルA2">
              デジタルA2
            </option>
            <option value="デジタルB1">
              デジタルB1
            </option>
            <option value="デジタルB2">
              デジタルB2
            </option>
          </select>
        </div>
      </div>

      <Graph
        ref="renderGraphRelative"
        style="background-color: #EEEEEE; padding: 8px;"
        :source="source"
        :source-type="{
          main: source.main.length,
          sub: source.sub.length
        }"
      />
    </section>
    <div class="btn-bar">
      <div class="control-btn">
        <a
          v-if="shouldPause"
          id="play-btn"
          :class="connected ? '' : 'disable'"
          @click="reverseShouldPause"
        >
          <img
            src="../../../../public/img/icon-play.svg"
            alt="取得開始"
          >
        </a>
        <a
          v-else
          id="pause-btn"
          :class="connected ? '' : 'disable'"
          @click="reverseShouldPause"
        >
          <img
            src="../../../../public/img/icon-pause.svg"
            alt="取得停止"
          >
        </a>
      </div>
      <ul class="right-btn-list">
        <li>
          <a
            id="delete-btn"
            :class="existValue ? '' : 'disable'"
            @click="deleteModalOpen('reset')"
          >
            <img
              src="../../../../public/img/icon-reset.svg"
              alt="リセット"
            >
          </a>
        </li>
        <li>
          <a
            id="dl-csv"
            :class="existValue ? '' : 'disable'"
            @click="DLModalOpen"
          >
            <img
              src="../../../../public/img/icon-download.svg"
              alt="ダウンロード"
            >
          </a>
        </li>
      </ul>
    </div>
    <modal name="delete-confirm">
      <div class="modal-header">
        <h2>確認</h2>
      </div>
      <div class="modal-body">
        <p>この操作を実行すると現在表示されているデータが全て削除されますが本当によろしいですか?</p>
        <a
          id="delete-btn"
          class="btn-square-little-rich"
          @click="deleteModalOK"
        >
          <img
            src="../../../../public/img/icon-exe.svg"
            alt="実行"
            class="btn-icon"
          >
          <span class="btn-text">実行</span>
        </a>
        <a
          id="delete-btn"
          class="btn-square-little-rich cancel"
          @click="deleteModalNG"
        >
          <img
            src="../../../../public/img/icon-cancel.svg"
            alt="キャンセル"
            class="btn-icon"
          >
          <span class="btn-text">キャンセル</span>
        </a>
      </div>
    </modal>
    <modal name="download">
      <div class="modal-header">
        <h2>ダウンロード</h2>
      </div>
      <div>
        <div
          v-if="source.main.length || source.sub.length"
          class="modal-body"
        >
          <button
            class="btn-square-little-rich"
            @click="exportData(true, false)"
          >
            <img
              src="../../../../public/img/icon-csv.svg"
              alt="csvファイル"
              class="btn-icon"
            >
            <span class="btn-text">csv形式(UTF-8)</span>
          </button>
          <button
            class="btn-square-little-rich"
            @click="exportData(true, true)"
          >
            <img
              src="../../../../public/img/icon-csv.svg"
              alt="csvファイル"
              class="btn-icon"
            >
            <span class="btn-text">csv形式(SJIS)</span>
          </button>
          <button 
            class="btn-square-little-rich"
            @click="exportData(false, false)"
          >
            <img
              src="../../../../public/img/icon-xlsx.svg"
              alt="xlsxファイル"
              class="btn-icon"
            >
            <span class="btn-text">xlsx形式</span>
          </button>
        </div>
        <div
          v-else
          class="modal-body"
        >
          <span class="btn-text">データが存在しません</span>
        </div>
        <div class="modal-body">
          <button 
            class="modal-close-btn"
            @click="DLModalClose"
          >
            <i class="far fa-times-circle fa-lg" />閉じる
          </button>
        </div>
      </div>  
    </modal>
  </div>
</template>
<script>
import Graph from '../../view/Graph'
import ProgressTimer from '../../view/ProgressTimer.vue'
import Vue from 'vue'
import { mapGetters, mapState } from 'vuex'
import VModal from 'vue-js-modal'
import ExcelJS from 'exceljs'
import encoding from 'encoding-japanese'
Vue.use(VModal)

export default {
  components: {
    Graph,
    ProgressTimer,
  },
  data() {
    return {
      interval: 1000,
      shouldReDo: {
        main: true,
        sub: true,
        interval: true
      },
      deleteCallFrom: '',
      newKindValue: {
        main: '',
        sub: ''
      },
      oldKindValue: {
        main: '',
        sub: ''
      }
    }
  },
  computed: {
    ...mapState({
      shouldPause: state => state.firmata.shouldPause,
      graphValue: state => state.firmata.graphValue,
      graphValueSub: state => state.firmata.graphValueSub,
    }),
    ...mapGetters({
      source: 'firmata/values',
      connected: 'firmata/connected',
      existValue: 'firmata/existValue',
      renderTimerStartTime: 'firmata/renderTimerStartTime',
      milliSeconds: 'firmata/milliSeconds',
    }),
    graphKind: {
      get() {
        return this.$store.state.firmata.axisInfo.main.kind
      },
      set(payload) {
        this.$store.commit('firmata/setKind', payload)
      }
    },
    graphKindSub: {
      get() {
        return this.$store.state.firmata.axisInfo.sub.kind
      },
      set(payload) {
        this.$store.commit('firmata/setKindSub', payload)
      }
    },
    inProgress() {
      return this.connected && !this.shouldPause && (this.$store.state.firmata.axisInfo.main.kind || this.$store.state.firmata.axisInfo.main.sub)
    },
    lastMainValue() {
      return this.source.main[this.source.main.length - 1]?.y
    },
    lastSubValue() {
      return this.source.sub[this.source.sub.length - 1]?.y
    },
  },
  watch: {
    graphKind: function(newVal, oldVal) {
      if (this.existValue) {
        if (this.shouldReDo.main) {
          this.newKindValue.main = newVal
          this.oldKindValue.main = oldVal
          this.shouldReDo.main = false
          this.graphKind = oldVal
          this.deleteModalOpen('main')
        }else {
          this.shouldReDo.main = true
        }
      }
    },
    graphKindSub: function(newVal, oldVal) {
      if (this.existValue) {
        if (this.shouldReDo.sub) {
          this.newKindValue.sub = newVal
          this.oldKindValue.sub = oldVal
          this.shouldReDo.sub = false
          this.graphKindSub = oldVal
          this.deleteModalOpen('sub')
        }else {
          this.shouldReDo.sub = true
        }
      }
    },
    interval: function(newValue, oldValue) {
      if (this.shouldReDo.interval) {
        // this.deleteModalOpen('interval', () => 
        this.$store.dispatch('firmata/setMilliSeconds', Number(newValue))
          .catch(() => {
            console.error('unexpected interval value.')
            this.shouldReDo = false
            this.interval = oldValue
          })
        // })   
      }else {
        this.shouldReDo.interval = true
      }
    }
  },
  mounted() {
    this.oldKindValue.main = this.graphKind
    this.oldKindValue.sub = this.graphKindSub
  },
  methods: {
    reset() {
      this.$store.commit('firmata/resetValue', 'all')
    },
    reverseShouldPause() {
      if (this.connected) {
        this.$store.dispatch('firmata/setShouldPause', !this.shouldPause)
      }
    },
    transDate(iso8601String) {
      const date = new Date(iso8601String)
      return date.getFullYear() + '/' +
          (date.getMonth() + 1) + '/' +
          date.getDate() + ' ' +
          date.getHours() + ':' +
          date.getMinutes() + ':' +
          date.getSeconds()
    },
    async exportData(isCsv, isSJIS) {
      const name = 'TFabGraph_AkaDako版'

      // それぞれの軸のデータがあればローカルストレージから項目名を取得
      // ローカルストレージに値がなければ「主軸」等の名前を付ける
      // データが無い場合は空欄にする
      const valueHeader = {
        main: this.graphValue.length ? localStorage.getItem('graphKind') ? localStorage.getItem('graphKind') : '主軸' : '',
        sub: this.graphValueSub.length ? localStorage.getItem('graphKindSub') ? localStorage.getItem('graphKindSub') : '第2軸' : '',
      }

      // ワークシート全体の設定
      const workbook = new ExcelJS.Workbook()
      workbook.addWorksheet(name)
      const worksheet = workbook.getWorksheet(name)
      worksheet.columns = [
        { header: '時刻', key: 'x' },
        { header: valueHeader.main, key: 'yMain' },
        { header: valueHeader.sub, key: 'ySub' }
      ]

      // ファイルの元となるデータの配列
      // 両軸のデータを統合したものを格納する
      let sourceForDL = []

      // 主軸のデータをまずはそのまま格納
      this.source.main.forEach(e => {
        sourceForDL.push({
          x: e.x,
          yMain: e.y,
          ySub: null
        })
      })

      // 第2軸のデータを格納
      this.source.sub.forEach(e => {
        // 両軸で時刻が一致しているものを見つける
        const found = sourceForDL.find(el => el.x == e.x)

        // 一致したデータがあった場合はその要素にプロパティとして第2軸のデータを格納
        if (found) {
          found.ySub = e.y
        }else {
          // 一致したデータがなかった場合は新規要素として第2軸のデータを格納
          sourceForDL.push({
            x: e.x,
            yMain: null,
            ySub: e.y
          })
        }
      })

      // 統合した後の配列を時系列順にソート
      sourceForDL.sort((a, b) => {
        return (a.x < b.x) ? -1 : 1
      })

      // データをシートに追加
      worksheet.addRows(sourceForDL)

      // 3通りのファイル形式を引数に応じて生成
      const uint8Array = isCsv ? (isSJIS ? new Uint8Array(
        encoding.convert(await workbook.csv.writeBuffer(), {
          from: 'UTF8',
          to: 'SJIS'
        })
      ) : await workbook.csv.writeBuffer()) : await workbook.xlsx.writeBuffer()

      // DLするための処理
      const blob = new Blob([uint8Array], { type: 'application/octet-binary' })
      const link = document.createElement('a')
      link.href = (window.URL || window.webkitURL).createObjectURL(blob)
      link.download = `${name}.${isCsv ? 'csv' : 'xlsx'}`
      link.click()
      link.remove()
    },
    async deleteModalOK() {
      this.reset()
      if (this.deleteCallFrom === 'main') {
        // this.$store.dispatch('firmata/setShouldPause', true)
        this.shouldReDo.main = false
        this.graphKind = this.newKindValue.main
        this.shouldReDo.main = true
        if (this.graphKind) {
          await this.$store.dispatch('firmata/render', true)
        }
      }else if(this.deleteCallFrom === 'sub') {
        // this.$store.dispatch('firmata/setShouldPause', true)
        this.shouldReDo.sub = false
        this.graphKindSub = this.newKindValue.sub
        this.shouldReDo.sub = true
        if (this.graphKindSub) {
          await this.$store.dispatch('firmata/render', false)
        }
      }else if(this.deleteCallFrom === 'reset') {
        // this.$store.dispatch('firmata/setShouldPause', true)
      }else if(typeof this.deleteModalOKCallback === 'function') {
        await this.deleteModalOKCallback()
      }
      this.deleteModalClose()
    },
    async deleteModalNG() {
      if (this.deleteCallFrom === 'main') {
        this.shouldReDo.main = true
      }else if(this.deleteCallFrom === 'sub') {
        this.shouldReDo.sub = true
      }else if(typeof this.deleteModalNGCallback === 'function') {
        await this.deleteModalNGCallback()
      }
      this.deleteModalClose()
    },
    deleteModalOpen(callFrom, okCallback, ngCallback) {
      // this.$store.dispatch('firmata/setShouldPause', true)
      this.deleteCallFrom = callFrom
      this.deleteModalOKCallback = okCallback
      this.deleteModalNGCallback = ngCallback
      this.$modal.show('delete-confirm')
    },
    deleteModalClose() {
      this.$modal.hide('delete-confirm')
    },
    DLModalOpen() {
      this.$modal.show('download')
    },
    DLModalClose() {
      this.$modal.hide('download')
    }
  }
}
</script>
<style scoped>
.graph{
  background-color: #EEEEEE;
  padding: 20px;
}

select{
  outline: none;
}

.btn-bar{
  position:relative;
  display:flex;
}

.control-btn{
  width:64px;
  height:64px;
  margin:auto;
}

.control-btn a.disable{
  pointer-events:none;
  opacity:.3;
  filter: grayscale(100%);
}

.control-btn img{
  width:100%;
}

.right-btn-list{
  position:absolute;
  right:0;
  display:flex;
  border:2px solid #ccc;
  border-radius:6px;
  background:#fff;
  padding:5px 0;
}

.right-btn-list li{
  width:65px;
  border-right:2px solid #ccc;
}

.right-btn-list li:last-of-type{
  border-right:none;
}

.right-btn-list li a{
  display:block;
  padding:8px;
  height:100%;
}

.right-btn-list a.disable{
  pointer-events:none;
  opacity:.3;
  filter: grayscale(100%);
}

.right-btn-list li a img{
  display:block;
  width:26px;
  margin:auto;
}

.btn-square-little-rich {
  position: relative;
  display: flex;
  align-items:center;
  justify-content:center;
  padding: 10px 15px;
  text-decoration: none;
  color: #FFF;
  background: #27ae60;
  /*色*/
  border: solid 1px #27ae60;
  /*線色*/
  border-radius: 4px;
  text-shadow: 0 1px 0 rgba(0,0,0,0.2);
  margin: 10px 15px;
  height: 50px;
}

.btn-square-little-rich.cancel {
  background:#ff0000;
  border: solid 1px #ff0000;
  text-shadow: 0 1px 0 rgba(0,0,0,0.2);
}

.btn-square-little-rich:active {
  /*押したとき*/
  border: solid 1px #2c6ac4;
  box-shadow: none;
  text-shadow: none;
}

.btn-icon{
  display:inline-block;
  margin-right:3px;
  width:20px;
  height:auto;
}

.btn-text{
  padding: 0 5px;
  font-size:15px;
  font-weight:bold;
}

.content-box {
  text-align: center;
  width: 100%;
  background: #fff;
  margin: 0 0 15px 0;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

#loader{
  display: inline-block;
  position: relative;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 4px solid #fff;
  border-right-color: transparent;
  animation: spin 1s linear infinite;
}

@keyframes spin{
  0% {
    transform: rotate(0deg)
}

  50% {
    transform: rotate(180deg)
  }

  100% {
    transform: rotate(360deg)
  }
}

.modal-header h2{
  padding:15px;
  text-align:center;
  font-size:20px;
  font-weight:bold;
  background:#333;
  color:#fff;
}

.modal-body{
  display:flex;
  justify-content:center;
  flex-wrap:wrap;
  align-items:center;
  padding:25px;
  min-height:250px;
}

.modal-body p{
  margin-bottom:1em;
  font-size:16px;
  line-height:1.6;
}

.modal-body button{
  cursor:pointer;
}

.modal-body button:hover{
  opacity:.7;
}

.modal-close-btn{
  display:flex;
  align-items:center;
  position:absolute;
  right:20px;
  bottom:15px;
  font-size:16px;
  font-weight:bold;
  color:#999;
}

.modal-close-btn i{
  margin-right:4px;
}

.sensor-select-wrap{
  display:flex;
  justify-content:space-between;
  margin-bottom:15px;
}

.sensor-select-wrap select{
  position:relative;
  min-width:100px;
  padding:8px;
  border:2px solid #333;
  border-radius:4px;
  color:#333;
  font-weight:bold;
  cursor:pointer;
}

.sensor-select-wrap select:nth-of-type(2){
  border:2px solid #26AE60;
  color:#26AE60;
}

select:disabled{
  opacity:.5;
  cursor:auto;
}

.progress-timer {
  padding:0;
  margin:0;
  position: absolute;
  width:100px;
}
input.last-main-value {
  border: none;
  text-align: left;
  padding-left: 1em;
}
input.last-sub-value {
  border: none;
  text-align: right;
  padding-right: 1em;
}
</style>
