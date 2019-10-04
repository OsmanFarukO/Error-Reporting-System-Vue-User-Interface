<template>
  <v-container fluid grid-list-md fill-height >
    <v-layout align-space-around>
      <v-flex xs4>
        <v-card>
          <v-card-title primary-title>
            <div>
              <h3 class="headline mb-0">Yeni Eleman Ekle</h3>
            </div>
          </v-card-title>
          <v-form
            style="margin-left: 25px; margin-right: 25px;"
            ref="form"
            v-model="valid"
            lazy-validation
          >
          <!--
            <v-text-field
              v-model="username"
              :rules="nameRules"
              label="Elemanın Kullanıcı Adı"
              required
            ></v-text-field>
          -->
            <v-text-field
              v-model="first_name"
              :rules="nameRules"
              label="Elemanın Adı"
              required
            ></v-text-field>
            <v-text-field
              v-model="last_name"
              :rules="nameRules"
              label="Elemanın Soyadı"
              required
            ></v-text-field>
            <v-text-field
              type="email"
              v-model="email"
              :rules="nameRules"
              label="Mail Adresi"
              required
            ></v-text-field>
            <v-text-field
              type="password"
              v-model="password"
              :rules="nameRules"
              label="Kullanıcı Şifresi"
              required
            ></v-text-field>
            <v-text-field
              type="number"
              v-model="tc_no"
              :rules="nameRules"
              label="Elemanın TC Kimlik Numarası"
              required
            ></v-text-field>

            <v-card-actions>
              <v-layout
                align-center
                justify-end
              >
                <v-btn
                  :disabled="!valid"
                  color="success"
                  @click="validate"
                  flat
                >
                  Kaydet
                </v-btn>
              </v-layout>
            </v-card-actions>
          </v-form>
        </v-card>
      </v-flex>
      <v-flex xs8>
        <v-toolbar flat color="white">
          <v-toolbar-title>Kurum Çalışanları</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn color="success" dark @click="fullmapModal = true">
            Personelleri Görüntüle
          </v-btn>
          <v-btn color="primary" dark @click="updateEmployees()">
            Güncelle
          </v-btn>
        </v-toolbar>
        <v-data-table
          :headers="headers"
          :items="employees"
          class="elevation-1"
          hide-actions
        >
          <template v-slot:no-data>
            <v-alert :value="true" color="error" icon="warning">
              Henüz bir eleman bulunmamaktadır.
            </v-alert>
          </template>
          <template v-slot:items="props">
            <td>{{ props.item.emp_name }}</td>
            <td class="text-xs-middle">{{ props.item.emp_fname }}</td>
            <td class="text-xs-middle">{{ props.item.emp_lname }}</td>
            <td class="text-xs-middle">{{ props.item.emp_tc }}</td>
            <td>
              <v-switch :label="props.item.emp_active ? 'Aktif' : 'Pasif'" v-model="props.item.emp_active" :key="props.item.emp_id"></v-switch>
            </td>
            <td class="text-xs-middle">
              <template v-if="props.item.emp_isbusy">
                <v-chip color="orange">Müşteride</v-chip>
              </template>
              <template v-else>
                <v-chip color="blue-white">Müsait</v-chip>
              </template>
              <!--
              emp_passive
              <template v-else>
                <v-btn color="error" @click=deleteEmployee(props.item.emp_id) >Sil</v-btn>
              </template>
              -->
            </td>
            <td class="text-xs-middle">
              <v-btn color="success" @click=locationEmployee(props.item) >Lokasyon</v-btn>
            </td>
          </template>
        </v-data-table>
      </v-flex>
    </v-layout>

    <v-dialog
      v-model="mapModal"
      width="1500"
      height="1500"
    >

    <!--
    :coords="[37.871429, 32.491374]"
    -->
      <yandex-map
        :coords="[lat, lon]"
        zoom="17"
        scroll-zoom="true"
        style="width: 1500px; height: 1500px;"
        :behaviors="['drag', 'scrollZoom']"
        :placemarks="placemarks"
      >
          <ymap-marker
            marker-id="1"
            marker-type="placemark"
            :coords="[lat, lon]"
            hint-content="Hint content 1"
            :balloon="{header: 'header', body: 'body', footer: 'footer'}"
            :marker-fill="{color: '#000000', opacity: 0.4}"
            :marker-stroke="{color: '#ff0000', width: 5}"
            :icon="{color: 'green', glyph: 'blueCircleDotIcon'}"
            cluster-name="1"
          ></ymap-marker>
          <!--
          <ymap-marker
            marker-id="3"
            marker-type="circle"
            :coords="[lat, lon]"
            circle-radius="160"
            hint-content="Hint content 1"
            :balloon="{header: 'header', body: 'body', footer: 'footer'}"
          ></ymap-marker>
          -->
      </yandex-map>
    </v-dialog>
    <v-dialog
      v-model="fullmapModal"
      fullscreen
    >
      <googlemaps-map
        class="map"
        :center.sync="center"
        :zoom.sync="zoom"
      >
        <!-- User Position -->
        <googlemaps-user-position
          @update:position="setUserPosition" />

        <googlemaps-marker
          v-for="(emp, index) in employees"
          :title="emp.emp_userself"
          :key="index"
          :label="{
            color: 'black',
            text: emp.emp_fname.substring(0,1) + emp.emp_lname.substring(0,1),
          }"
          :position="{ lat: emp.emp_lat, lng: emp.emp_lon}" />
        <!-- Polyline -->
      </googlemaps-map>
    </v-dialog>
    <v-snackbar
      v-model="expiredLimit"
      bottom
      left
      :timeout="6000"
    >
      Kurum limitinizi doldurdunuz.
    </v-snackbar>
  </v-container>
</template>

<script>
import { yandexMap, ymapMarker } from 'vue-yandex-maps'

export default {
  components: {
    'yandex-map': yandexMap,
    'ymap-marker': ymapMarker
  },
  data: () => ({
    expiredLimit: false,
    markedOnClick: { lat: 37.864269, lng: 32.452331 },
    center: {
      lat: 37.864269,
      lng: 32.452331
    },
    path: [
      {
        lat: 48.853,
        lng: 2.298
      },
      {
        lat: 48.8735,
        lng: 2.2951
      }
    ],
    options: {
    },
    userPosition: null,
    zoom: 12,
    employees: [],
    employeeLocationRealTime: null,
    headers: [
      {
        text: 'Eleman Kullanıcı Adı',
        align: 'left',
        sortable: false,
        value: 'emp_name'
      },
      { text: 'İsmi', sortable: false, value: 'emp_fname' },
      { text: 'Soyismi', sortable: false, value: 'emp_lname' },
      { text: 'TC Kimlik Numarası', sortable: false, value: 'emp_tc' },
      { text: 'Çalışma Durumu', sortable: false, value: 'emp_active' },
      { text: 'Durumu', sortable: false, value: 'emp_id' },
      { text: 'Lokasyon', sortable: false, value: 'emp_id' }
    ],
    valid: true,
    nameRules: [
      v => !!v || 'Zorunlu alan'
    ],
    username: null,
    email: null,
    password: null,
    first_name: null,
    last_name: null,
    tc_no: null,
    lat: 0,
    lon: 0,
    mapModal: false,
    fullmapModal: false
  }),
  methods: {
    locationEmployee (emp) {
      this.lat = emp.emp_lat
      this.lon = emp.emp_lon
      this.mapModal = true
    },
    deleteEmployee (empid) {
      this.$http.delete(this.$parent.$parent.$parent.$parent.api_base_url + 'emps/' + empid + '/')
        .then((response) => {
          if (response.status === 200) {
            this.getEmployees()
          }
        }).catch((e) => {
          alert(e)
        })
    },
    validate () {
      if (this.$refs.form.validate()) {
        this.addNewEmployee()
      }
    },
    addNewEmployee () {
      this.$http.put(this.$parent.$parent.$parent.$parent.api_base_url + 'emps/', {
        // username: this.username,
        email: this.email,
        password: this.password,
        first_name: this.first_name,
        last_name: this.last_name,
        tc_no: this.tc_no
      }).then((response) => {
        if (response.status === 200) {
          this.$store.commit('decreaseDeviceCount')
          this.getEmployees()
        }
      }).catch((e) => {
        this.expiredLimit = true
      })
    },
    updateEmployees () {
      this.$parent.$parent.$parent.$parent.loadDialog = true
      this.$http.post(this.$parent.$parent.$parent.$parent.api_base_url + 'updateemps/', {
        emps: this.employees
      }).then((response) => {
        if (response.status === 200) {
          this.$parent.$parent.$parent.$parent.loadDialog = false
          this.$parent.$parent.$parent.$parent.snackbar = true
          this.getEmployees()
        }
      }).catch((e) => {
        alert(e)
      })
      console.log('TT :: ', this.employees)
    },
    getEmployees () {
      this.$http.get(this.$parent.$parent.$parent.$parent.api_base_url + 'emps/')
        .then((response) => {
          if (response.status === 200) {
            if (response.body !== []) {
              this.employees = response.body
              console.log('thisEMPS ', this.employees)
            }
          }
        }).catch((e) => {
          alert(e)
        })
    },
    connectws () {
      this.socket = new WebSocket('ws://localhost:8000/ws_admin/')
      this.socket.onopen = () => {
        console.log('connected')
        this.socket.send(JSON.stringify({
          command: 'add_corporation_group',
          oauth_token: localStorage.getItem('access_token')
        }))
        this.socket.onmessage = ({data}) => {
          console.log('datae', data)
        }
      }
    }
  },
  beforeCreate () {
    this.employeeLocationRealTime = setInterval(() => {
      this.getEmployees()
    }, 60000)
    this.$http.get(this.$parent.$parent.$parent.$parent.api_base_url + 'emps/')
      .then((response) => {
        if (response.status === 200) {
          if (response.body !== []) {
            this.employees = response.body
          }
        }
      }).catch((e) => {
        alert(e)
      })
  },
  destroyed () {
    clearInterval(this.employeeLocationRealTime)
  },
  created () {
    this.connectws()
    // this.$options.sockets.onmessage = (data) => console.log('>> ', data)
    // this.$socket.sendObj({awesome: 'data'})
  },
  computed: {
    placemarks () {
      let mark = [
        {
          coords: [this.lat, this.lon],
          properties: {
            iconContent: 'blueCircleDotIcon'
          }, // define properties here
          options: {}, // define options here
          clusterName: '1',
          balloonTemplate: '<div>"Your custom template"</div>',
          callbacks: { click: function () { console.log('XXX') } }
        }
      ]
      console.log('AAAAA :: ', mark)
      return mark
    },
    allempPlacemarks () {
      let mark = []
      for (var i = this.employees.length - 1; i >= 0; i--) {
        mark.push({
          coords: [this.employees[i].emp_lat, this.employees[i].emp_lon],
          properties: {
            iconContent: 'blueCircleDotIcon'
          }, // define properties here
          options: {}, // define options here
          clusterName: '1',
          balloonTemplate: '<div>"Your custom template"</div>',
          callbacks: { click: function () { console.log('XXX') } }
        })
      }
      return mark
    }
  }
}
</script>
<style scoped>
.demo {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.map {
  flex: 100% 1 1;
  width: 100%;
  height: 100%;
}
</style>
