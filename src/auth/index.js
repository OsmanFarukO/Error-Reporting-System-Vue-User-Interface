import { default as router } from '../router'
import Vue from 'vue'

import { API_BASE_URL, CLIENT_ID, CLIENT_SECRET } from '../apiconfig'
const LOGIN_URL = API_BASE_URL + 'auth/login'
const LOGOUT_URL = API_BASE_URL + 'auth/logout'

/* global localStorage */

export default {

  // User object will let us check authentication status
  user: {
    authenticated: false
  },

  logout (context, redirect) {
    context.$http.post(LOGOUT_URL, {'logout': true}).then(data => {
      localStorage.removeItem('access_token')
      this.user.authenticated = false
      if (redirect) {
        router.go(redirect)
      }
    }).error((err) => {
      context.error = err
    })
  },

  clearAuth () {
    localStorage.removeItem('access_token')
  },

  checkAuth () {
    var jwt = localStorage.getItem('access_token')
    if (jwt) {
      this.user.authenticated = true
    } else {
      this.user.authenticated = false
    }
  },

  getAuthHeader () {
    if (localStorage.getItem('access_token')) {
      return 'Bearer ' + localStorage.getItem('access_token')
    } else {
      return false
    }
  },

  // In Auth service
  refreshToken (context, request) {
    return new Promise(function (resolve, reject) {
      // Refresh token
      var creds = {
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'grant_type': 'refresh_token',
        'refresh_token': 'token',
        'scope': 'read'
      }
      Vue.http.post(LOGIN_URL, creds).then(response => {
        // Store refreshed token
        // localStorage.setItem('access_token', response.data.access_token)
        // Resubmit original request and resolve the response (probably shouldn't be the responsibility of the Auth service...)
        Vue.http(request).then(function (newResponse) {
          resolve(newResponse)
        })
      }, function (newResponse) {
        reject(newResponse)
      })
    })
  },

  checkExpiredToken (response) {
    return new Promise(function (resolve, reject) {
      // If token is expired, refresh token, resubmit original request & resolve response for original request
      // || response.status === 0 || response.detail === 'Invalid token'
      if (response.status === 403 && (response.body.detail === 'Invalid token' || response.body.detail.indexOf('User inactive or deleted') !== -1)) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user_store')
        localStorage.clear()
        router.push('/login')
        this.refreshToken(this.request).then(function (response) {
          resolve(response)
        })
      }
      // Otherwise just resolve the current response
      resolve(response)
    }.bind(this))
  }
}
