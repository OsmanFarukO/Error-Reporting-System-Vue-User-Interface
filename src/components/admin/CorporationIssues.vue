<template>
  <v-container fluid fill-height >
    <v-layout align-space-around>
      <v-flex xs12 sm12 offset-sm0>
        <v-data-table
          :headers="headers"
          :items="issues"
          class="elevation-1"
          hide-actions
        >
          <template v-slot:no-data>
            <v-alert :value="true" color="error" icon="warning">
              Henüz bir hata tespiti atanmadı.
            </v-alert>
          </template>
          <template v-slot:items="props">
            <td><v-chip @click="customerModal(props.item.customer_information)">{{ props.item.customer_information.user.first }} {{ props.item.customer_information.user.last }}</v-chip></td>
            <td><v-chip color="green" @click="employeeModal(props.item.employee_information)">{{ props.item.employee_information.user.first }} {{ props.item.employee_information.user.last }}</v-chip></td>
            <!--
            <template v-if="props.item.iss_content.length > 12 ">
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <td class="text-xs-middle" v-on="on">{{ props.item.iss_content.substring(0, 12) }}  ...</td>
                </template>
                <span >{{ props.item.iss_content }}</span>
              </v-tooltip>
            </template>
            <template v-else>
              <td class="text-xs-middle">{{ props.item.iss_content }}</td>
            </template>
            -->
            <template v-if="props.item.issue_information.title.length > 25">
              <td><v-chip color="grey" @click="issueModal(props.item.issue_information)">{{ props.item.issue_information.title.substring(0, 25) }} ...</v-chip></td>
            </template>
            <template v-else>
              <td><v-chip color="grey" @click="issueModal(props.item.issue_information)">{{ props.item.issue_information.title }}</v-chip></td>
            </template>
            <td>{{moment(props.item.created_date).format('LLLL')}}</td>
            <td>
              <template v-if='props.item.refuse'>
                <v-chip color="red" class="white--text" @click="refuseModalOpen(props.item.refuse_desc)">ÇALIŞAN İADE ETTİ</v-chip>
              </template>
              <template  v-else>
                <template v-if="props.item.issue_information.is_done">
                  {{moment(props.item.finish_date).format('LLLL')}} tarihinde tamamlandı.
                </template>
                <template v-else>
                  Onarım aşamasında
                </template>
              </template>
            </td>
            <td>
              <template v-if="props.item.total !== null">
                <v-btn color="primary" @click="materialModal(props.item.used_mat, props.item)">{{ props.item.total }} ₺</v-btn>
              </template>
              <template v-else>
                <v-btn color="green lighten-5" @click="materialModal(props.item.used_mat, props.item)">0 ₺</v-btn>
              </template>
            </td>
          </template>
        </v-data-table>
      </v-flex>
    </v-layout>
    <v-dialog
      v-model="issModal"
      width="700"
    >
      <v-card>

        <v-list two-line>
          <v-list-tile>
            <v-list-tile-action>
              <v-icon color="indigo">assignment</v-icon>
            </v-list-tile-action>

            <v-list-tile-content>
              <template v-if="tempIss.title.length > 50 ">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-list-tile-title v-on="on">{{ tempIss.title.substring(0, 50) }}  ...</v-list-tile-title>
                  </template>
                  <span >{{ tempIss.title }}</span>
                </v-tooltip>
              </template>
              <template v-else>
                <v-list-tile-title>{{ tempIss.title }}</v-list-tile-title>
              </template>
              <v-list-tile-sub-title>Hata Başlığı</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>

          <v-list-tile>
            <v-list-tile-action></v-list-tile-action>
            <v-list-tile-content>
              <template v-if="tempIss.content.length > 50 ">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-list-tile-title v-on="on">{{ tempIss.content.substring(0, 50) }}  ...</v-list-tile-title>
                  </template>
                  <span >{{ tempIss.content }}</span>
                </v-tooltip>
              </template>
              <template v-else>
                <v-list-tile-title>{{ tempIss.content }}</v-list-tile-title>
              </template>
              <v-list-tile-sub-title>Hata Özeti</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-divider inset></v-divider>

          <v-list-tile>
            <v-list-tile-action>
              <v-icon color="indigo">build</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <template v-if="tempIss.issue_emergency === 1">
                <v-list-tile-title>ACİL</v-list-tile-title>
              </template>
              <template v-else-if="tempIss.issue_emergency === 2">
                <v-list-tile-title>ÇOK ACİL</v-list-tile-title>
              </template>
              <template v-else>
                <v-list-tile-title>ACİL DEĞİL</v-list-tile-title>
              </template>
              <v-list-tile-sub-title>Aciliyeti</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>

          <v-list-tile>
            <v-list-tile-action></v-list-tile-action>
            <v-list-tile-content>
              <template v-if="tempIss.is_done">
                <v-list-tile-title>Onarıldı</v-list-tile-title>
              </template>
              <template v-else>
                <v-list-tile-title>Onarım Aşamasında</v-list-tile-title>
              </template>
              <v-list-tile-sub-title>Durumu</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>

        </v-list>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="empModal"
      width="700"
    >
      <v-card>
        <v-list two-line>
          <v-list-tile>
            <v-list-tile-action>
              <v-icon color="indigo">person</v-icon>
            </v-list-tile-action>

            <v-list-tile-content>
              <v-list-tile-title>{{ tempEmp.user.username }}</v-list-tile-title>
              <v-list-tile-sub-title>Kullanıcı Adı</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>

          <v-list-tile>
            <v-list-tile-action></v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>{{ tempEmp.user.first }} {{ tempEmp.user.last }}</v-list-tile-title>
              <v-list-tile-sub-title>İsim Soyisim</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>

          <v-divider inset></v-divider>

          <v-list-tile>
            <v-list-tile-action>
              <v-icon color="indigo">mail</v-icon>
            </v-list-tile-action>

            <v-list-tile-content>
              <v-list-tile-title>{{ tempEmp.user.mail }}</v-list-tile-title>
              <v-list-tile-sub-title>E-mail</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>

          <v-divider inset></v-divider>

          <v-list-tile @click="locationEmp(tempEmp.location)">
            <v-list-tile-action>
              <v-icon color="indigo">location_on</v-icon>
            </v-list-tile-action>

            <v-list-tile-content>
              <v-list-tile-title>Görüntülemek için dokunun</v-list-tile-title>
              <v-list-tile-sub-title>Eleman Lokasyonu</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="cstModal"
      width="700"
    >
      <v-card>
        <v-list two-line>
          <v-list-tile>
            <v-list-tile-action>
              <v-icon color="indigo">person</v-icon>
            </v-list-tile-action>

            <v-list-tile-content>
              <v-list-tile-title>{{ tempCustomer.user.username }}</v-list-tile-title>
              <v-list-tile-sub-title>Kullanıcı Adı</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>

          <v-list-tile>
            <v-list-tile-action></v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>{{ tempCustomer.user.first }} {{ tempCustomer.user.last }}</v-list-tile-title>
              <v-list-tile-sub-title>İsim Soyisim</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>

          <v-divider inset></v-divider>

          <v-list-tile>
            <v-list-tile-action>
              <v-icon color="indigo">mail</v-icon>
            </v-list-tile-action>

            <v-list-tile-content>
              <v-list-tile-title>{{ tempCustomer.user.mail }}</v-list-tile-title>
              <v-list-tile-sub-title>E-mail</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>

          <v-divider inset></v-divider>

          <v-list-tile>
            <v-list-tile-action>
              <v-icon color="indigo">business_center</v-icon>
            </v-list-tile-action>

            <v-list-tile-content>
              <v-list-tile-title>{{ tempCustomer.facility }}</v-list-tile-title>
              <v-list-tile-sub-title>Şirket Adı</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
          <!--
          <v-divider inset></v-divider>

          <v-list-tile @click="locationCst(tempCustomer.facility_location)">
            <v-list-tile-action>
              <v-icon color="indigo">location_on</v-icon>
            </v-list-tile-action>

            <v-list-tile-content>
              <v-list-tile-title>Görüntülemek için dokunun</v-list-tile-title>
              <v-list-tile-sub-title>Tesis Lokasyonu</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
          -->
        </v-list>
      </v-card>
    </v-dialog>
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
      v-model="mapModal"
      width="1500"
      height="1500"
    >
      <yandex-map
        :coords="[lat, lon]"
        zoom="17"
        :scroll-zoom="true"
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
            :icon="{color: 'green', glyph: 'cinema'}"
            cluster-name="1"
          ></ymap-marker>
      </yandex-map>
    </v-dialog>

    <v-dialog
      v-model="matModal"
      width="700"
      height="1500"
    >
      <v-card>
        <v-card-title>
          Kullanılan Malzemeler
          <v-spacer></v-spacer>
          <v-btn color="green lighten-2" @click="openAddNewMaterial()">ekle</v-btn>
        </v-card-title>
        <v-card-text>
          <v-list>
            <template v-if="tempUsed !== []">
              <template v-for="(item, index) in tempUsed">
                <v-list-tile
                  :key="index"
                >
                  <v-list-tile-content>
                    <v-list-tile-title>{{item.mat_name}}</v-list-tile-title>
                    <v-list-tile-sub-title>{{item.mat_price}} BİRİM FİYATI</v-list-tile-sub-title>
                  </v-list-tile-content>
                  <v-list-tile-content>
                    <v-list-tile-title>{{item.count}} ADET</v-list-tile-title>
                  </v-list-tile-content>
                  <v-list-tile-content>
                    <v-text-field
                      v-model="item.mat_price"
                      type='number'
                    ></v-text-field>
                  </v-list-tile-content>
                </v-list-tile>
              </template>
            </template>
            <template v-else>
              <center>Malzeme kullanılmadı.</center>
            </template>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-1" flat @click="matModal = false">Kapat</v-btn>
          <v-btn color="blue darken-1" flat @click="updateMaterials()">Güncelle</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="refuseModal"
      persistent
      max-width="290"
    >
      <v-card>
        <v-card-title class="headline">İşi Reddetme Nedeni</v-card-title>

        <v-card-text>
          {{refuseDesc}}
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            flat="flat"
            @click="refuseModal = false"
          >
            Tamam
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="addMatModal" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Malzeme Ekle</span>
        </v-card-title>
        <v-form v-model="valid" ref="form">
          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12>
                  <v-select
                    v-model="selectedNewMaterial"
                    :items="corporationMaterialsvalue"
                    :rules="[v => !!v || 'Lütfen bir malzeme seçiniz']"
                    label="Malzeme Seçiniz"
                    required
                  ></v-select>
                </v-flex>
                <v-flex xs12>
                  <v-text-field v-model="newMaterialCount" label="Malzeme Adeti" :rules="[v => !!v || 'Lütfen adet giriniz']" required></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="black darken-1" flat @click="addMatModal = false">Kapat</v-btn>
            <v-btn color="black darken-1" flat @click="addNewMaterialToIssue" :class=" { 'green darken-1 white--text' : valid, disabled: !valid }">Kaydet</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
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
        Kapat
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
    intervalFetch: null,
    errorSnackbar: false,
    errorText: null,
    timeout: 6000,
    selectedIss: null,
    empDialog: false,
    employees: [],
    issues: [],
    headers: [
      {
        text: 'Müşteri',
        align: 'left',
        sortable: false,
        value: 'customer_information'
      },
      { text: 'Eleman', sortable: false, value: 'employee_information' },
      { text: 'Hata Özeti', sortable: false, value: 'issue_information' },
      { text: 'Bildiri Tarihi', sortable: false, value: 'created_date' },
      { text: 'Durumu', sortable: false, value: 'finish_date' },
      { text: 'Kullanılan Malzemeler', sortable: false, value: '_id' }
    ],
    lat: 0,
    lon: 0,
    mapModal: false,
    tempCustomer: {
      'user': {
        'username': '',
        'first': '',
        'last': '',
        'mail': ''
      },
      'facility': '',
      'facility_location': [0, 0]
    },
    tempEmp: {
      'user': {
        'username': '',
        'first': '',
        'last': ''
      },
      'location': [0, 0],
      'is_busy': null
    },
    empModal: false,
    cstModal: false,
    tempIss: {
      'title': '',
      'content': '',
      'issue_emergency': '',
      'is_done': '',
      'is_attached': ''
    },
    issModal: false,
    tempUsed: [],
    matModal: false,
    refuseModal: false,
    refuseDesc: '',
    tempIssueId: null,
    addMatModal: false,
    selectedNewMaterial: null,
    corporationMaterials: [],
    newMaterialCount: 1,
    corporationMaterialsvalue: [],
    valid: false
  }),
  methods: {
    addNewMaterialToIssue () {
      if (this.$refs.form.validate()) {
        this.matModal = false
        this.addMatModal = false
        let indes = this.corporationMaterialsvalue.indexOf(this.selectedNewMaterial)
        this.$parent.$parent.$parent.$parent.loadDialog = true
        this.$http.patch(this.$parent.$parent.$parent.$parent.api_base_url + 'patchused/' + this.tempIssueId + '/', {
          material_id: this.corporationMaterials[indes].material_id,
          material_count: this.newMaterialCount
        })
          .then((response) => {
            this.getIssues()
            this.$parent.$parent.$parent.$parent.loadDialog = false
          }).catch((e) => {
            alert(e)
          })
      }
    },
    openAddNewMaterial () {
      this.addMatModal = true
    },
    refuseModalOpen (desc) {
      this.refuseModal = true
      this.refuseDesc = desc
    },
    materialModal (mats, issue) {
      this.tempIssueId = issue._id
      this.tempUsed = mats
      this.matModal = true
    },
    issueModal (iss) {
      this.tempIss = iss
      this.issModal = true
    },
    employeeModal (emp) {
      this.tempEmp = emp
      this.empModal = true
    },
    customerModal (cst) {
      this.tempCustomer = cst
      this.cstModal = true
    },
    locationCst (cst) {
      this.lat = cst[0]
      this.lon = cst[1]
      this.cstModal = false
      this.mapModal = true
    },
    locationEmp (emp) {
      this.lat = emp[0]
      this.lon = emp[1]
      this.empModal = false
      this.mapModal = true
    },
    locationEmployee (emp) {
      this.lat = emp.emp_lat
      this.lon = emp.emp_lon
      this.empDialog = false
      this.mapModal = true
    },
    updateMaterials () {
      this.matModal = false
      this.$parent.$parent.$parent.$parent.loadDialog = true
      console.log('<<< ', this.tempIssueId)
      this.$http.post(this.$parent.$parent.$parent.$parent.api_base_url + 'patchused/', {
        '_fuck': this.tempUsed,
        '_all_fucked': this.tempIssueId
      })
        .then((response) => {
          this.getIssues()
          this.$parent.$parent.$parent.$parent.loadDialog = false
        }).catch((e) => {
          alert(e)
        })
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
    getTotal (r) {
      for (var i = r.length - 1; i >= 0; i--) {
        if (r[i].used_mat.length === 0) {
          r[i].total = null
        } else {
          let to = 0
          for (var j = r[i].used_mat.length - 1; j >= 0; j--) {
            to += r[i].used_mat[j].count * r[i].used_mat[j].mat_price
          }
          r[i].total = to
        }
      }
      return r
    },
    getIssues () {
      this.$http.get(this.$parent.$parent.$parent.$parent.api_base_url + 'cstiss_opt/')
        .then((response) => {
          if (response.status === 200) {
            if (response.body !== []) {
              this.issues = this.getTotal(response.body)
              this.getMaterials()
            }
          }
        }).catch((e) => {
          alert(e)
        })
    },
    getMaterials () {
      this.$http.get(this.$parent.$parent.$parent.$parent.api_base_url + 'materials/')
        .then((response) => {
          if (response.status === 200) {
            if (response.body !== []) {
              this.corporationMaterials = response.body
              for (var i = 0; i <= this.corporationMaterials.length - 1; i++) {
                this.corporationMaterialsvalue.push(this.corporationMaterials[i].material_name)
              }
            }
          }
        }).catch((e) => {
          alert(e)
        })
    }
  },
  beforeCreate () {
    this.intervalFetch = setInterval(() => {
      this.getIssues()
    }, 60000)
    this.$http.get(this.$parent.$parent.$parent.$parent.api_base_url + 'cstiss_opt/')
      .then((response) => {
        if (response.status === 200) {
          if (response.body !== []) {
            this.issues = this.getTotal(response.body)
          }
        }
      }).catch((e) => {
        alert(e)
      })
  },
  destroyed () {
    clearInterval(this.intervalFetch)
  },
  mounted () {
    this.getMaterials()
  },
  computed: {
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
      return mark
    }
  }
}
</script>
