import { mount, createLocalVue, config } from '@vue/test-utils'
import Dashboard from '@/components/pages/Dashboard.vue'
import Vuex from 'vuex'
jest.mock('chart.js')

config.showDeprecationWarnings = false

jest.setTimeout(10000)

const localVue = createLocalVue()
localVue.use(Vuex)
const store = new Vuex.Store({
  modules: {
    firmata: require('@/store/modules/firmata').default
  }
})
let wrapper = {}

beforeEach(() => {
  wrapper = mount(Dashboard, {
    localVue,
    store
  })
})

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

describe('広告表示', () => {
  test('広告が2秒後に消える', async () => {
    expect(wrapper.find('.common-ad').exists()).toBe(true)
    await sleep(1000)
    expect(wrapper.find('.common-ad').exists()).toBe(true)
    await sleep(1000)
    expect(wrapper.find('.common-ad').exists()).toBe(false)
    wrapper.destroy()
  })

  test('広告が1.9秒後には表示されている', async () => {
    expect(wrapper.find('.common-ad').exists()).toBe(true)
    await sleep(1000)
    expect(wrapper.find('.common-ad').exists()).toBe(true)
    await sleep(900)
    expect(wrapper.find('.common-ad').exists()).toBe(true)
    wrapper.destroy()
  })
})
