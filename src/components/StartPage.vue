<template>
  <v-container fluid fill-height class="loginOverlay">
    <v-layout flex align-center justify-center>
      <v-flex xs12 sm4 elevation-6>
        <v-toolbar class="pt-2 blue darken-4">
        <!--
          <v-toolbar-title class="white--text"><h4>Welcome Back</h4></v-toolbar-title>
        -->
        </v-toolbar>
        <v-card>
          <v-card-text class="pt-4">
            <div>
                <v-form v-model="valid" ref="form">
                  <v-text-field
                    label="Kullanıcı Adınızı Giriniz"
                    v-model="username"
                    :rules="nameRules"
                    required
                  ></v-text-field>
                  <v-text-field
                    label="Kullanıcı Şifrenizi Giriniz"
                    v-model="password"
                    min="8"
                    :append-icon="e1 ? 'visibility' : 'visibility_off'"
                    :append-icon-cb="() => (e1 = !e1)"
                    :type="e1 ? 'password' : 'text'"
                    :rules="passwordRules"
                    counter
                    required
                  ></v-text-field>
                  <v-layout justify-space-between>
                    <v-btn @click="submit" :class=" { 'blue darken-4 white--text' : valid, disabled: !valid }">Giriş Yap</v-btn>
                  </v-layout>
                </v-form>
            </div>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
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
        client_secret: this.$parent.oauth_client_secret,
        user_type: 0
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
  },
  created () {
    console.log(this.$parent)
  }
}
</script>
