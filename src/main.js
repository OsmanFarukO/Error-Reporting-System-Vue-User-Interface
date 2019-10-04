// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import App from './App'
import router from './router'
import 'vuetify/dist/vuetify.min.css'
import Vuetify from 'vuetify'
import Resource from 'vue-resource'
import { API_BASE_URL } from './apiconfig'
import auth from './auth'
import YmapPlugin from 'vue-yandex-maps'
import moment from 'moment'
import VueGoogleCharts from 'vue-google-charts'
import store from './store'
import 'vue-googlemaps/dist/vue-googlemaps.css'
import VueGoogleMaps from 'vue-googlemaps'
// import VueNativeSock from 'vue-native-websocket'
// import VueWebsocket from 'vue-websocket'
// Vue.use(VueNativeSock, 'ws://localhost:8000/ws_admin/', { format: 'json' })

Vue.use(VueGoogleMaps, {
  load: {
    // Google API key
    apiKey: 'AIzaSyBROn4_3v0RjjxoAF5sskfYsbH2e3_22DQ',
    // Enable more Google Maps libraries here
    libraries: ['places'],
    // Use new renderer
    useBetaRenderer: false
  }
})

Vue.use(Vuex)
moment.locale('tr')
Vue.prototype.moment = moment
// Vue.use(VueWebsocket, 'ws://localhost:8000/ws_admin/')
auth.checkAuth()
const options = {
  lang: 'tr_TR'
}
Vue.use(YmapPlugin, options)

Vue.use(VueGoogleCharts)
Vue.use(Vuetify)
Vue.use(Resource)

Vue.config.productionTip = false

let authUrl = API_BASE_URL + 'o/token/'
let loginUrl = 'http://localhost:8080/#/'
Vue.http.interceptors.push(function (request, next) {
  // Add JWT to all requests
  if (request.url !== authUrl) {
    request.headers.set('Authorization', auth.getAuthHeader())
  }
  // 'Content-Type': 'application/x-www-form-urlencoded'
  request.headers.set('Content-Type', 'application/json')
  // Skip storing token refresh requests
  this.request = request
  next(function (response) {
    if (window.location.href !== loginUrl) {
      auth.checkExpiredToken(response).then(function (response) {
        return response
      })
    }
  })
}.bind(this))

router.beforeEach((route, redirect, next) => {
  if (auth.user.authenticated) {
    if (route.name === 'StartPage') {
      next('/dashboard')
    } else {
      next()
    }
  } else {
    if (route.name === 'StartPage') {
      next()
    } else {
      next('/')
    }
  }
})

new Vue({ // eslint-disable-line no-new
  el: '#app',
  store,
  router,
  // i18n,
  components: { App },
  template: '<App/>'
})
