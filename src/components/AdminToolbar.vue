<template>
  <div>
    <v-toolbar fixed app :clipped-left="clipped">
      <v-img @click="toGo('/dashboard')" class="hidden-sm-and-down" style="max-width: 80px; min-width: 80px;" :src="require('../assets/logo_min.png')"></v-img>
      <v-toolbar-items class="hidden-xs-only">
        <v-btn flat
          v-for="item in menuItems"
          :key="item.title"
          :to="item.link"
          >
          <v-icon left>{{ item.icon }}</v-icon>
          <v-badge color="red" v-if="item.badge">
            <span slot="badge">{{ item.badge }}</span>
            <span>{{ item.title }}</span>
          </v-badge>
          <span v-else>{{ item.title }}</span>
        </v-btn>
        <v-btn flat @click="newIssueForm()">
          <v-icon left>add</v-icon>
          <span>Yeni Arıza Bildirimi</span>
        </v-btn>
      </v-toolbar-items>
      <v-spacer></v-spacer>
      <v-chip color="grey">{{device_left}} kullanıcı hakkınız kaldı</v-chip>
      <v-btn icon @click.stop="drawer = !drawer">
        <v-icon>settings</v-icon>
      </v-btn>
      <v-btn icon @click="sureExit()">
        <v-icon>exit_to_app</v-icon>
      </v-btn>
    </v-toolbar>
    <v-dialog v-model="exitDialog" persistent max-width="290">
      <v-card>
        <v-card-title class="headline">Emin misiniz?</v-card-title>
        <v-card-text>Çıkış yapmak istediğinizden emin misiniz?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" flat @click="exitDialog = false">İptal</v-btn>
          <v-btn color="green darken-1" flat @click="exitApp()">Çıkış Yap</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="formDialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Yeni Müşteri Hatası Raporla</span>
        </v-card-title>
        <v-form v-model="valid" ref="form">
          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12 sm6>
                  <v-select
                    v-model="selectedCustomer"
                    :items="customersvalue"
                    :rules="[v => !!v || 'Lütfen bir müşteri seçiniz']"
                    label="Müşteri Seçiniz"
                    required
                  ></v-select>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-select
                    v-model="selectedFacility"
                    :items="facs"
                    :rules="[v => !!v || 'Lütfen bir tesis seçiniz']"
                    label="Müşteri Tesisi Seçiniz"
                    required
                  ></v-select>
                </v-flex>
                <v-flex xs12>
                  <v-text-field v-model="titleNew" label="Rapor Başlığı" :rules="[v => !!v || 'Lütfen bir başlık giriniz']" required></v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-text-field v-model="content" label="Kısa Açıklama" :rules="[v => !!v || 'Lütfen bir açıklama giriniz']" required></v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-select
                    v-model="selectImportant"
                    :items="emergencyItems"
                    :rules="[v => !!v || 'Lütfen bir durum seçiniz']"
                    label="Hata aciliyeti seçiniz"
                    required
                  ></v-select>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="black darken-1" flat @click="formDialog = false">Kapat</v-btn>
            <v-btn color="black darken-1" flat @click="submit" :class=" { 'green darken-1 white--text' : valid, disabled: !valid }">Kaydet</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
    <v-navigation-drawer
      v-model="drawer"
      absolute
      dark
      temporary
      right
    >
      <v-list
        subheader
        two-line
      >
        <v-subheader>Yönetim Ayarları</v-subheader>

        <v-list-tile>
          <v-list-tile-action>
            <v-checkbox v-model="letqueue"></v-checkbox>
          </v-list-tile-action>

          <v-list-tile-content @click="letqueue = !letqueue">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-list-tile-title v-on="on">En yakın çalışana ata</v-list-tile-title>
              </template>
              <span >Varsayılan olarak kapalıdır.Çalışanlar bir iş üzerindeyken başka bir iş verilmesini sağlar.</span>
            </v-tooltip>
            <v-list-tile-sub-title>İş atama</v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script>
import { mapState } from 'vuex'
/* global localStorage */
export default {
  data () {
    return {
      emergencyItems: ['Acil Değil', 'Acil', 'Çok Acil'],
      valid: false,
      titleNew: null,
      content: null,
      selectImportant: null,
      selectedCustomer: null,
      customers: [],
      customersvalue: [],
      letqueue: false,
      sound: false,
      video: false,
      invites: false,
      drawer: null,
      exitDialog: false,
      title: 'Vuetify.js',
      clipped: false,
      menuItems: [
        {icon: 'people', title: 'Müşteriler', link: '/dashboard/customers'},
        {icon: 'build', title: 'Malzemeler', link: '/dashboard/materials'},
        {icon: 'assignment_ind', title: 'Personel', link: '/dashboard/employees'},
        {icon: 'assignment', title: 'Arıza Bildirimleri', link: '/dashboard/issues'},
        {icon: 'assignment_turned_in', title: 'Hareketler', link: '/dashboard/corpissues'}
      ],
      formDialog: false,
      realSelectIndex: null,
      facs: [],
      selectedFacility: null,
      selectedRealFacility: null
    }
  },
  methods: {
    submit () {
      if (this.$refs.form.validate()) {
        this.createNewIssue()
      }
    },
    createNewIssue () {
      this.formDialog = false
      this.$parent.$parent.$parent.loadDialog = true
      this.$http.put(this.$parent.$parent.$parent.api_base_url + 'admin_addissue/', {
        cst_fac: this.selectedRealFacility,
        cst_id: this.realSelectIndex,
        titleNew: this.titleNew,
        content: this.content,
        selectImportant: this.emergencyItems.indexOf(this.selectImportant)
      }).then((response) => {
        this.$parent.$parent.$parent.loadDialog = false
        this.$parent.$parent.$parent.snackbar = true
      }).catch((e) => {
        alert(e)
      })
    },
    exitApp () {
      localStorage.removeItem('access_token')
      this.$router.replace('/')
      // this.$router.push()
      this.$router.go()
    },
    sureExit () {
      this.exitDialog = true
    },
    toGo (e) {
      this.$router.push(e)
    },
    newIssueForm () {
      this.formDialog = true
    }
  },
  watch: {
    selectedFacility () {
      let indesfac = this.facs.indexOf(this.selectedFacility)
      this.selectedRealFacility = this.facs[indesfac]
    },
    selectedCustomer () {
      this.facs = []
      let indes = this.customersvalue.indexOf(this.selectedCustomer)
      this.realSelectIndex = this.customers[indes].cst_id
      for (var j = 0; j <= this.customers[indes].facilities.length - 1; j++) {
        this.facs.push(this.customers[indes].facilities[j].tag)
      }
    },
    letqueue () {
      if (this.letqueue) {
        localStorage.setItem('@letqueue', true)
      } else {
        localStorage.setItem('@letqueue', false)
      }
    }
  },
  computed: {
    ...mapState({
      device_left: state => state.deviceLeft
    })
  },
  created () {
    this.letqueue = localStorage.getItem('@letqueue')
    this.$http.get(this.$parent.$parent.$parent.api_base_url + 'customers/')
      .then((response) => {
        if (response.status === 200) {
          if (response.body !== []) {
            this.customers = response.body
            for (var i = 0; i <= this.customers.length - 1; i++) {
              this.customersvalue.push(this.customers[i].cst_fname + ' ' + this.customers[i].cst_lname)
            }
          }
        }
      }).catch((e) => {
        alert(e)
      })
  }
}
</script>
