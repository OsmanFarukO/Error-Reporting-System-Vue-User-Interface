<template>
  <v-container fluid fill-height >
    <v-layout align-space-around>
      <v-flex xs12 sm12 offset-sm0>
        <v-toolbar flat color="white">
          <v-toolbar-title>Müşterilerinizin Arıza Bildirimleri</v-toolbar-title>
          <v-spacer></v-spacer>
          <!--
          <v-flex sm2>
            <v-overflow-btn
              outline
              fab
              v-model="filterTime"
              :items="['Hepsi', 'Arial', 'Calibri', 'Courier', 'Verdana']"
              label="Zamana Göre Filtrele"
              target="#dropdown-example"
            ></v-overflow-btn>
          </v-flex>
          -->
          <v-flex sm2>
            <v-overflow-btn
              outline
              v-model="filterType"
              color="indigo"
              :items="['Hepsi', 'Onarıldı', 'Atandı', 'Atanmamış', 'İade Edildi', 'Müşteri Limiti Dolanlar']"
              label="Duruma Göre Filtrele"
              target="#dropdown-example"
            ></v-overflow-btn>
          </v-flex>
        </v-toolbar>
        <v-data-table
          :headers="headers"
          :items="filteredIssues"
          class="elevation-1"
          hide-actions
          :loading="progreesTable"
        >
          <v-progress-linear v-slot:progress color="blue" indeterminate></v-progress-linear>
          <template v-slot:no-data>
            <v-alert :value="true" color="error" icon="warning">
              Henüz bir hata tespiti bulunmamaktadır.
            </v-alert>
          </template>
          <template v-slot:items="props">
            <td>{{ props.item.cst_fname }} {{ props.item.cst_lname }}</td>
            <template v-if="props.item.iss_title.length > 25">
              <td class="text-xs-middle">{{ props.item.iss_title.substring(0, 25) }} ...</td>
            </template>
            <template v-else>
              <td class="text-xs-middle">{{ props.item.iss_title }}</td>
            </template>
            <template v-if="props.item.iss_content.length > 25">
              <td class="text-xs-middle">{{ props.item.iss_content.substring(0, 25) }} ...</td>
            </template>
            <template v-else>
              <td class="text-xs-middle">{{ props.item.iss_content }}</td>
            </template>
            <td class="text-xs-middle">
              <template v-if="props.item.iss_emergency === 1">
                <v-chip color="orange" class="white--text">ACİL</v-chip>
              </template>
              <template v-else-if="props.item.iss_emergency === 2">
                <v-chip color="red" class="white--text">ÇOK ACİL</v-chip>
              </template>
              <template v-else>
                <v-chip>ACİL DEGİL</v-chip>
              </template>
            </td>
            <td class="text-xs-middle">{{moment(props.item.iss_date).format('LLLL')}}</td>
            <td class="text-xs-middle">
              <template v-if="props.item.is_attached">
                <v-btn color="primary">ATANDI</v-btn>
              </template>
              <template v-else>
                <template v-if="props.item.iss_done">
                  <v-btn color="secondary" @click=getReport(props.item.iss_id)>RAPOR İNCELE</v-btn>
                </template>
                <template v-else>
                  <v-btn color="success" @click=autoPush(props.item.iss_id) >Otomatik Ata</v-btn>
                  <v-btn color="success" @click=manualPush(props.item.iss_id) >Manuel Ata</v-btn>
                  <template v-if="props.item.is_refused">
                    <v-tooltip top>
                      <template v-slot:activator="{ on }">
                        <v-chip color="red darken-3" v-on="on" class="white--text">iade edildi</v-chip>
                      </template>
                      <span>{{props.item.reason}}</span>
                    </v-tooltip>
                  </template>
                  <template v-if="props.item.expired">
                    <v-tooltip top>
                      <template v-slot:activator="{ on }">
                        <v-chip color="black darken-3" v-on="on" class="white--text">müşteri limiti doldu</v-chip>
                      </template>
                      <span>Müşterinizin tanımlanan limiti dolmuştur.</span>
                    </v-tooltip>
                  </template>
                </template>
              </template>
            </td>
          </template>
        </v-data-table>
      </v-flex>
    </v-layout>

    <v-dialog
      v-model="empDialog"
      width="700"
      height="1500"
    >
     <v-list>
        <template v-for="(item, index) in employees">
          <v-list-tile
            :key="index"
          >
            <v-list-tile-content>
              <v-list-tile-title>{{item.emp_fname}} {{item.emp_lname}}</v-list-tile-title>
            </v-list-tile-content>
            <v-spacer></v-spacer>
            <v-list-tile-action style="margin-right: 15px;">
              <template v-if="item.emp_isbusy">
                <v-btn color="error" disable>MEŞGUL</v-btn>
              </template>
              <template v-else>
                <v-btn color="success" @click="attach(item.emp_id)">ATA</v-btn>
              </template>
            </v-list-tile-action>
            <v-list-tile-action>
              <v-btn color="primary" @click="locationEmployee(item)">LOKASYON</v-btn>
            </v-list-tile-action>
          </v-list-tile>
        </template>
      </v-list>
    </v-dialog>
    <v-dialog
      v-model="reportDialog"
      width="700"
      height="1500"
    >
      <v-list>
        <template v-if="reportType">
          <template v-for="(item, index) in issueReport">
            <v-list-tile
              :key="index"
            >
              <v-list-tile-content>
                <v-list-tile-title>{{item.mat_name}}</v-list-tile-title>
                <v-list-tile-sub-title>{{item.mat_price}} BİRİM FİYATI</v-list-tile-sub-title>
              </v-list-tile-content>
              <v-list-tile-content>
                <v-list-tile-title>{{item.count}} ADET</v-list-tile-title>
                <v-list-tile-sub-title>{{item.total}} Toplam Maaliyet</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </template>
        </template>
        <template v-else>
          <center>Malzeme kullanılmadı.</center>
        </template>
      </v-list>
    </v-dialog>
    <v-dialog
      v-model="mapModal"
      width="1500"
      height="1500"
    >
      <yandex-map
        :coords="[lat, lon]"
        zoom="7"
        style="width: 1500px; height: 1500px;"
        :behaviors="['ruler']"
        :controls="['trafficControl']"
        :placemarks="placemarks"
      >
          <ymap-marker
            marker-id="1"
            marker-type="placemark"
            :coords="[lat, lon]"
            hint-content="Hint content 1"
            :balloon="{header: 'header', body: 'body', footer: 'footer'}"
            :icon="{color: 'green', glyph: 'cinema'}"
            cluster-name="1"
          ></ymap-marker>
      </yandex-map>
    </v-dialog>

    <v-snackbar
      v-model="errorSnackbar"
      bottom
      left
      :timeout="timeout"
    >
      {{ errorText }}
      <v-btn
        color="pink"
        flat
        @click="errorSnackbar = false"
      >
        Close
      </v-btn>
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
    progreesTable: false,
    filterType: 'Hepsi',
    cstissueInterval: null,
    issueReport: null,
    reportDialog: false,
    errorSnackbar: false,
    errorText: null,
    timeout: 6000,
    selectedIss: null,
    empDialog: false,
    employees: [],
    issues: [],
    filteredIssues: [],
    headers: [
      {
        text: 'Hata Bildiren Kullanıcı',
        align: 'left',
        sortable: false,
        value: 'iss_id'
      },
      { text: 'Başlık', sortable: false, value: 'iss_title' },
      { text: 'Açıklama', sortable: false, value: 'iss_content' },
      { text: 'Aciliyeti', sortable: false, value: 'iss_emergency' },
      { text: 'Girildiği Tarih', sortable: false, value: 'iss_date' },
      { text: 'Durumu', sortable: false, value: 'iss_done' }
    ],
    lat: 0,
    lon: 0,
    mapModal: false
  }),
  methods: {
    getReport (issid) {
      this.$http.get(this.$parent.$parent.$parent.$parent.api_base_url + 'issues/' + issid + '/')
        .then((response) => {
          if (response.status === 200) {
            if (response.body !== []) {
              this.issueReport = this.getTotal(response.body)
              this.reportDialog = true
            }
            console.log('issueReport :: ', this.issueReport)
          }
        }).catch((e) => {
          alert(e)
        })
    },
    getTotal (res) {
      if (res.length !== 0) {
        for (var i = res.length - 1; i >= 0; i--) {
          res[i].total = res[i].mat_price * res[i].count
        }
      }
      return res
    },
    attach (empid) {
      this.$http.put(this.$parent.$parent.$parent.$parent.api_base_url + 'cstiss_opt/', {
        iss_id: this.selectedIss,
        emp_id: empid
      })
        .then((response) => {
          if (response.status === 200) {
            this.getIssues()
            this.empDialog = false
          }
        }).catch((e) => {
          console.log(e)
        })
    },
    locationEmployee (emp) {
      this.lat = emp.emp_lat
      this.lon = emp.emp_lon
      this.empDialog = false
      this.mapModal = true
    },
    getIssues () {
      this.$http.get(this.$parent.$parent.$parent.$parent.api_base_url + 'issues/')
        .then((response) => {
          if (response.status === 200) {
            if (response.body !== []) {
              this.issues = response.body
              this.filteredIssues = this.issues
              this.filterType = 'Hepsi'
            }
          }
        }).catch((e) => {
          alert(e)
        })
    },
    autoPush (issid) {
      let letqueue = false
      if (localStorage.getItem('@letqueue') === true) {
        letqueue = true
      }
      this.$parent.$parent.$parent.$parent.loadDialog = true
      this.$http.post(this.$parent.$parent.$parent.$parent.api_base_url + 'cstiss_opt/', {
        check_busy: letqueue,
        iss_id: issid
      })
        .then((response) => {
          if (response.status === 200) {
            this.getIssues()
            this.$parent.$parent.$parent.$parent.loadDialog = false
            this.$parent.$parent.$parent.$parent.snackbar = true
          }
        }).catch((e) => {
          this.$parent.$parent.$parent.$parent.loadDialog = false
          if (e.body.error === 'all_emps_in_cases') {
            this.errorSnackbar = true
            this.errorText = 'Boşta Eleman Yok'
          }
        })
    },
    manualPush (issid) {
      this.getEmployees()
      this.selectedIss = issid
      this.empDialog = true
    },
    getEmployees () {
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
    filterIssues (ty) {
      this.filteredIssues = []
      for (var i = this.issues.length - 1; i >= 0; i--) {
        if (ty === 'Hepsi') {
          this.filteredIssues = this.issues
        } else if (ty === 'Onarıldı') {
          if (this.issues[i].iss_done) {
            this.filteredIssues.push(this.issues[i])
          }
        } else if (ty === 'Atandı') {
          if (this.issues[i].is_attached) {
            this.filteredIssues.push(this.issues[i])
          }
        } else if (ty === 'Atanmamış') {
          if (this.issues[i].is_attached === false && this.issues[i].iss_done === false) {
            this.filteredIssues.push(this.issues[i])
          }
        } else if (ty === 'İade Edildi') {
          if (this.issues[i].is_refused) {
            this.filteredIssues.push(this.issues[i])
          }
        } else {
          if (this.issues[i].expired && this.issues[i].iss_done === false && this.issues[i].is_attached === false) {
            this.filteredIssues.push(this.issues[i])
          }
        }
      }
    }
  },
  beforeCreate () {
    this.cstissueInterval = setInterval(() => {
      this.getIssues()
    }, 60000)
    this.$http.get(this.$parent.$parent.$parent.$parent.api_base_url + 'issues/')
      .then((response) => {
        if (response.status === 200) {
          if (response.body !== []) {
            this.issues = response.body
            this.filteredIssues = this.issues
            console.log('RRR ', this.issues)
          }
        }
      }).catch((e) => {
        alert(e)
      })
  },
  destroyed () {
    clearInterval(this.cstissueInterval)
  },
  watch: {
    filterType () {
      this.progreesTable = true
      this.filterIssues(this.filterType)
      this.progreesTable = false
    }
  },
  computed: {
    reportType () {
      if (this.issueReport !== null) {
        if (this.issueReport.length === 0) {
          return false
        } else {
          return true
        }
      } else {
        return false
      }
    },
    placemarks () {
      let mark = [
        {
          coords: [this.lat, this.lon],
          properties: {}, // define properties here
          options: {}, // define options here
          clusterName: '1',
          balloonTemplate: '<div>"Your custom template"</div>',
          callbacks: { click: function () {} }
        }
      ]
      console.log('AAAAA :: ', mark)
      return mark
    }
  }
}
</script>
