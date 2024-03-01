/* eslint-disable */

//import Vue from 'vue'
//import Buefy from 'buefy'
//import VisApp from '@/components/VisApp'
import store from './store'
//import { mapGetters, mapActions } from 'vuex'

/*
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
    render: h => h(VisApp)
}).$mount('#app')
*/
/*
globalVar["ma"] = mapActions({
    connect: 'firmata/connect',
    disConnect: 'firmata/disConnect'
});

globalVar["mg"] = mapGetters({
    connected: 'firmata/connected',
});
*/

globalStore = store;
