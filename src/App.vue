<template>
  <div id="app">
    <v-dialog
      v-model="loadDialog"
      hide-overlay
      persistent
      width="300"
    >
      <v-card
        color="primary"
        dark
      >
        <v-card-text>
          Lütfen Bekleyiniz
          <v-progress-linear
            indeterminate
            color="white"
            class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-snackbar
      v-model="snackbar"
      bottom
      left
      :timeout="timeout"
    >
      İşleminin başarılı bir şekilde oluşturuldu.
    </v-snackbar>
    <router-view/>
  </div>
</template>

<script>
import { API_BASE_URL, CLIENT_ID, CLIENT_SECRET, GRANT_TYPE } from './apiconfig'

export default {
  name: 'App',
  data: () => ({
    timeout: 6000,
    snackbar: false,
    loadDialog: false,
    api_base_url: API_BASE_URL,
    oauth_client_id: CLIENT_ID,
    oauth_client_secret: CLIENT_SECRET,
    oauth_grant_type: GRANT_TYPE
  })
}
</script>
