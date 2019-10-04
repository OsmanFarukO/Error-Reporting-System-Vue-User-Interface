<template>
  <v-app>
    <admin-toolbar></admin-toolbar>
    <v-content>
      <router-view/>
    </v-content>
  </v-app>
</template>

<script>
/* global localStorage */
import AdminToolbar from './AdminToolbar'
export default {
  components: {
    'admin-toolbar': AdminToolbar
  }
}
</script>
