<template>
  <v-container fluid fill-height class="loginOverlay">
    AAAAAAAA
  </v-container>
</template>

<script>
export default {
  data: () => ({
    e1: true,
    username: '',
    valid: false,
    password: '',
    passwordRules: [
      (v) => !!v || 'Şifre Zorunlu'
    ],
    nameRules: [
      (v) => !!v || 'Kullanıcı Adı Zorunlu'
    ]
  }),
  methods: {
    submit () {
      if (this.$refs.form.validate()) {
        this.login()
      }
    },
    login: function () {
      this.$http.post(this.$parent.api_base_url + 'auth/login/', {
        grant_type: this.$parent.oauth_grant_type,
        username: this.username,
        password: this.password,
        scope: 'read',
        client_id: this.$parent.oauth_client_id,
        client_secret: this.$parent.oauth_client_secret
      }).then((response) => {
        if (response.status === 200) {
          let res = JSON.parse(response.body)
          localStorage.setItem('access_token', res.access_token)
          this.$router.replace({name: 'Dashboard'})
          this.$router.go()
        }
      }).catch((e) => {
        if (e.status === 0) {
          alert('Server error.')
        } else {
          alert(e.body[Object.keys(e.body)[0]])
        }
      })
    }
  }
}
</script>
