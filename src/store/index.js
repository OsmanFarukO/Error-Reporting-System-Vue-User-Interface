import Vue from 'vue'
import Vuex from 'vuex'
/* global localStorage */
Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    deviceLeft: localStorage.getItem('leftdeviceCount'),
    deviceLimit: 0
  },
  mutations: {
    setDefaultLeft (state, pl) {
      state.deviceLeft = pl.devicecount
    },
    decreaseDeviceCount (state) {
      state.deviceLeft -= 1
    },
    setDeviceLimit (state, payload) {
      state.deviceLimit = payload.limit
    }
  }
})

export default store
