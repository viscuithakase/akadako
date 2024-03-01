import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

import DataGetter from '@/lib/firmata/dataGetter'
import AkaDakoBoard from '@/lib/firmata/akadako-board'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault(dayjs.tz.guess())

const milliSecondsList = [
  1000,
  3000,
  5000,
  10000,
  30000,
  60000,
  180000,
  300000,
  600000,
  1800000
]

const midiPortFilters = [
  { manufacturer: null, name: /STEAM BOX/ },
  { manufacturer: null, name: /MidiDako/ },
  { manufacturer: null, name: /AkaDako/ }
]

const serialPortOptions = {
  filters: [
    { usbVendorId: 0x04D8, usbProductId: 0xE83A }, // Licensed for AkaDako
    { usbVendorId: 0x04D8, usbProductId: 0x000A }, // Dev board
    { usbVendorId: 0x04D9, usbProductId: 0xB534 } // Use in the future
  ]
}

const tmpAxisInfo = {
  main: localStorage.getItem('graphKind') || '',
  sub: localStorage.getItem('graphKindSub') || '',
}

const state = {
  board: null,
  dataGetter: null,
  milliSeconds: 1000,
  axisInfo: {
    main: {
      shouldRender: tmpAxisInfo.main ? true : false,
      kind: tmpAxisInfo.main
    },
    sub: {
      shouldRender: tmpAxisInfo.sub ? true : false,
      kind: tmpAxisInfo.sub
    }
  },
  renderTimer: null,
  renderTimerStartTime: 0,
  graphValue: JSON.parse(localStorage.getItem('graphValue') || '[]'),
  graphValueSub: JSON.parse(localStorage.getItem('graphValueSub') || '[]'),
  shouldPause: true,
  errorCnt: 0
}

const getters = {
  connected() {
    if (state.board && state.board.isConnected()) {
      return true
    }
    return false
  },
  test() {
    return 'test'
  },
  board() {
    return state.board
  },
  values() {
    return {
      main: state.graphValue,
      sub: state.graphValueSub
    }
  },
  existValue() {
    return state.graphValue.length || state.graphValueSub.length ? true : false
  },
  milliSeconds() {
    return state.milliSeconds
  },
  renderTimerStartTime() {
    return state.renderTimerStartTime
  },
  errorCnt() {
    return state.errorCnt
  }
}

const mutations = {
  addValue(state, { isMain, newValue }) {
    if (isMain) {
      state.graphValue.push(newValue)
      localStorage.setItem('graphValue', JSON.stringify(state.graphValue))
    } else {
      state.graphValueSub.push(newValue)
      localStorage.setItem('graphValueSub', JSON.stringify(state.graphValueSub))
    }
  },
  resetValue(state, target) {
    if (target == 'main') {
      state.graphValue = []
      localStorage.setItem('graphValue', JSON.stringify([]))
    } else if (target == 'sub') {
      state.graphValueSub = []
      localStorage.setItem('graphValueSub', JSON.stringify([]))
    } else if (target == 'all') {
      state.graphValue = []
      localStorage.setItem('graphValue', JSON.stringify([]))
      state.graphValueSub = []
      localStorage.setItem('graphValueSub', JSON.stringify([]))
    }
  },
  setKind(state, payload) {
    state.axisInfo.main.kind = payload
    localStorage.setItem('graphKind', payload)
    state.axisInfo.main.shouldRender = payload ? true : false
  },
  setKindSub(state, payload) {
    state.axisInfo.sub.kind = payload
    localStorage.setItem('graphKindSub', payload)
    state.axisInfo.sub.shouldRender = payload ? true : false
  },
  setShouldRender(state, { isMain, payload }) {
    if (isMain) {
      state.axisInfo.main.shouldRender = payload
    } else {
      state.axisInfo.sub.shouldRender = payload
    }
  }
}

const actions = {
  clearError() {
    state.errorCnt = 0
  },
  midiConnect(ctx) {
    try {
      return new Promise((resolve, reject) => {
        new AkaDakoBoard().connectMIDI(midiPortFilters)
          .then(connected => {
            if (connected == undefined) {
              reject('[MIDI]board is undefined')
            }

            ctx.state.board = connected
            connected.once(AkaDakoBoard.RELEASED, () => {
              ctx.state.board = null
            })
            ctx.state.dataGetter = new DataGetter(ctx.state.board)
            resolve()
          })
          .catch(() => {
            state.errorCnt++
            reject('no connected MIDI')
          })
      })
    } catch (e) {
      return Promise.reject(e)
    }
  },
  serialConnect(ctx) {
    try {
      if (!('serial' in navigator)) {
        return Promise.reject('This browser does not support Web Serial API.')
      }

      new AkaDakoBoard().connectSerial(serialPortOptions)
        .then(connected => {
          if (connected == undefined) {
            throw new Error('[Serial]board is undefined')
          }

          ctx.state.board = connected
          connected.once(AkaDakoBoard.RELEASED, () => {
            ctx.state.board = null
          })
          ctx.state.dataGetter = new DataGetter(ctx.state.board)
          return
        })
    } catch (e) {
      return Promise.reject(e)
    }
  },
  async connect(ctx) {
    ctx.dispatch('midiConnect')
      .catch((e) => {
        console.error(e)
        ctx.dispatch('serialConnect')
          .catch((err) => {
            console.error(err)
          })
      })
  },
  disConnect(ctx) {
    ctx.state.board.disconnect()

    ctx.state.axisInfo.main.shouldRender = false
    ctx.state.axisInfo.sub.shouldRender = false
    ctx.state.shouldPause = true

    // setTimeoutのタイマーが作動していたら解除して、IDをnullにする
    if (ctx.state.renderTimer) {
      clearTimeout(ctx.state.renderTimer)
      ctx.state.renderTimerStartTime = 0
    }
    ctx.state.renderTimer = null
  },
  async setValueToAdd(ctx) {
    if (ctx.state.board && ctx.state.board.isConnected() && !ctx.state.dataGetter) {
      ctx.state.dataGetter = new DataGetter(ctx.state.board)
    }

    // 両軸で描画する場合に同じ時間でプロットするためにここで時間を取得
    const date = dayjs().tz().format()

    if (ctx.state.axisInfo.main.shouldRender && ctx.state.axisInfo.sub.shouldRender) { // 両方の軸で描画する場合
      // 両方の軸で使うデータが全て取得完了するまで待機し、でき次第次の処理に移る
      // どちらかの取得に失敗した場合は描画しない

      Promise.all([
        ctx.state.dataGetter.getData(ctx.state.axisInfo.main.kind),
        ctx.state.dataGetter.getData(ctx.state.axisInfo.sub.kind)
      ])
        .then((res) => {
          if (res[0] != null && res[1] != null) {
            ctx.commit('addValue', {
              isMain: true,
              newValue: {
                y: res[0],
                x: date
              }
            })

            ctx.commit('addValue', {
              isMain: false,
              newValue: {
                y: res[1],
                x: date
              }
            })
          }
        })
        .catch((e) => {
          console.error(e)
        })
    } else if (ctx.state.axisInfo.main.shouldRender) { //main軸だけ描画する場合
      const data = await ctx.state.dataGetter.getData(ctx.state.axisInfo.main.kind)
      if (data != null) {
        ctx.commit('addValue', {
          isMain: true,
          newValue: {
            y: data,
            x: date
          }
        })
      }
    } else if (ctx.state.axisInfo.sub.shouldRender) { //sub軸だけ描画する場合
      const data = await ctx.state.dataGetter.getData(ctx.state.axisInfo.sub.kind)
      if (data != null) {
        ctx.commit('addValue', {
          isMain: false,
          newValue: {
            y: data,
            x: date
          }
        })
      }
    }
  },
  async render(ctx, isMain) {
    // setTimeoutのタイマーが作動していたら解除して、IDをnullにする
    if (ctx.state.renderTimer) {
      clearTimeout(ctx.state.renderTimer)
      ctx.state.renderTimerStartTime = 0
    }
    ctx.state.renderTimer = null

    // 選択された軸のデータを消去
    ctx.commit('resetValue', isMain ? 'main' : 'sub')

    // 各軸で描画すべきかどうかを更新
    ctx.commit('setShouldRender', {
      isMain: isMain,
      payload: isMain ? (ctx.state.axisInfo.main.kind === '' ? false : true) : (ctx.state.axisInfo.main.kind === '' ? false : true)
    })

    // ループさせる関数を定義
    // ポーズ状態でなければ描画し、一定時間後にタイマーで再実行する
    // disConnectするまではループが続く

    await ctx.dispatch('addValueLoop')
  },
  async addValueLoop(ctx) {
    if (!ctx.state.shouldPause) {
      await ctx.dispatch('setValueToAdd')
    }
    ctx.state.renderTimerStartTime = Date.now()
    ctx.state.renderTimer = setTimeout(async () => {
      await ctx.dispatch('addValueLoop')
    }, ctx.state.milliSeconds)
  },
  async setShouldPause(ctx, payload) {
    ctx.state.shouldPause = payload

    if (ctx.state.board && ctx.state.board.isConnected()) {
      // 各軸で描画すべきかどうかを更新
      ctx.commit('setShouldRender', {
        isMain: true,
        payload: ctx.state.axisInfo.main.kind === '' ? false : true
      })
      ctx.commit('setShouldRender', {
        isMain: false,
        payload: ctx.state.axisInfo.sub.kind === '' ? false : true
      })

      if (!payload) {
        // setTimeoutのタイマーが作動していたら解除して、IDをnullにする
        if (ctx.state.renderTimer) {
          clearTimeout(ctx.state.renderTimer)
          ctx.state.renderTimerStartTime = 0
        }
        await ctx.dispatch('addValueLoop')
      }
    }
  },
  setMilliSeconds(ctx, payload) {
    return new Promise((resolve, reject) => {
      if (milliSecondsList.includes(payload)) {
        ctx.state.milliSeconds = payload
        // 既存のタイマーがあれば解除
        if (ctx.state.renderTimer) {
          clearTimeout(ctx.state.renderTimer)
          ctx.state.renderTimerStartTime = 0
        }
        // 新しいタイマーをセット
        ctx.state.renderTimerStartTime = Date.now()
        ctx.state.renderTimer = setTimeout(async () => {
          await ctx.dispatch('addValueLoop')
        }, ctx.state.milliSeconds)
        resolve()
      }
      reject()
    })
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
