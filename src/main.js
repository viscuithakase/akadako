import Vue from 'vue'
import Buefy from 'buefy'
import App from '@/components/App'
import store from './store'

Vue.use(Buefy)

Vue.config.productionTip = false
// eslint-disable-next-line no-unused-vars
Vue.config.warnHandler = function (msg, vm, trace) {
  const ignoreWarnMessage = 'The .native modifier for v-on is only valid on components but it was used on <a>.'
  if (msg === ignoreWarnMessage) {
    msg = null
    vm = null
    // eslint-disable-next-line no-unused-vars
    trace = null
  }
}

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
