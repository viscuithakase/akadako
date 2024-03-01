import Vue from 'vue'
import Vuex from 'vuex'
import firmata from './modules/firmata'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    firmata
  }
})
