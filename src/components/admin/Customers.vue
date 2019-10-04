<template>
  <v-container fluid grid-list-md fill-height >
    <v-layout align-space-around>
      <v-flex xs12>
        <v-toolbar flat color="white">
          <v-toolbar-title>Müşterileriniz</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn color="primary" dark @click="openAddMusteriDialog()">
            Yeni Müşteri Ekle
          </v-btn>
          <v-btn color="success" :disabled="changedSomething" @click="updateDebtsForEach()">
            Güncelle
          </v-btn>
        </v-toolbar>
        <v-data-table
          :headers="headers"
          :items="customers"
          class="elevation-1"
          hide-actions
          :loading="progreesTable"
        >
          <v-progress-linear v-slot:progress color="blue" indeterminate></v-progress-linear>
          <template v-slot:no-data>
            <v-alert :value="true" color="error" icon="warning">
              Henüz bir müşteri bulunmamaktadır.
            </v-alert>
          </template>
          <template v-slot:items="props">
            <td>{{ props.item.cst_name }}</td>
            <td class="text-xs-middle">{{ props.item.cst_fname }}</td>
            <td class="text-xs-middle">{{ props.item.cst_lname }}</td>
            <td class="text-xs-middle">{{ props.item.cst_tc }}</td>
            <!--
            <td class="text-xs-right">
                <v-btn color="error" @click=wantDeleteModal(props.item.cst_id) >Sil</v-btn>
            </td>
            -->
            <td class="text-xs-middle">
              <v-btn color="success" @click=setFacilitiesCustomer(props.item) >Lokasyonlar</v-btn>
            </td>
            <td class="text-xs-middle">
              <v-btn color="secondary" @click=getDebtsOfCustomer(props.item) >Detaylar</v-btn>
              <v-btn color="orange" class="white--text" @click=getDebtsHistoryOfCustomer(props.item) >Ödeme Geçmişi</v-btn>
              <v-btn color="grey darken-5" class="white--text" @click=getCsvDocument(props.item) >Döküm Al</v-btn>
            </td>
            <td class="text-xs-middle">{{ props.item.payed }} ₺</td>
            <td class="text-xs-middle">{{ props.item.unpayed }} ₺</td>
            <td class="text-xs-middle">
            <!--
              <v-text-field
                label="Ödenen Miktar"
                type="number"
                v-model="props.item.debtpayed"
                :key="props.item.cst_id"
                @change="handleThis(props.item.debtpayed)"
              ></v-text-field>
            -->

              <v-edit-dialog
                :return-value.sync="props.item.debtpayed"
                lazy
                @save="updateDebtsForEach()"
              > {{ props.item.debtpayed }}
                <template v-slot:input>
                  <v-text-field
                    label="Ödenen Miktar"
                    type="number"
                    v-model="props.item.debtpayed"
                    :key="props.item.cst_id"
                    @change="handleThis(props.item.debtpayed)"
                  ></v-text-field>
                </template>
              </v-edit-dialog>

            </td>
            <td>
              <v-edit-dialog
                :return-value.sync="props.item.limit"
                lazy
                @save="updatelimit(props.item)"
              > {{ props.item.limit }}
                <template v-slot:input>
                  <v-text-field
                    v-model="props.item.limit"
                    type="number"
                    label="Güncelle"
                    single-line
                    counter
                  ></v-text-field>
                </template>
              </v-edit-dialog>
            </td>
          </template>
        </v-data-table>
      </v-flex>
    </v-layout>
    <v-dialog v-model="sureModal" persistent max-width="290">
      <v-card>
        <v-card-title class="headline">Emin misiniz?</v-card-title>
        <v-card-text>Belli müşterinizi silmek istediğinize emin misiniz?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" flat @click="sureModal = false">İptal</v-btn>
          <v-btn color="green darken-1" flat @click="deleteCustomer()">Sil</v-btn>
        </v-card-actions>
      </v-card>
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
        @click="getFuck(e)"
      >
          <ymap-marker
            marker-id="1"
            marker-type="placemark"
            :coords="[lat, lon]"
            hint-content="Hint content 1"
            :balloon="customerinfo"
            :icon="{color: 'green', glyph: 'cinema'}"
            cluster-name="1"
          ></ymap-marker>
      </yandex-map>
    </v-dialog>
    <v-dialog
      v-model="issueUsedMaterialsDialog"
      width='1200px'
      persistent
    >
      <v-card>
        <v-card-title>
          Kullanılan Malzemeler
        </v-card-title>
        <v-card-text>
          <v-list>
            <template v-if="issueUsedMaterials !== []">
              <template v-for="(item, index) in issueUsedMaterials">
                <v-list-tile
                  :key="index"
                >
                  <v-list-tile-content>
                    <v-list-tile-title>{{item.fields.mat_name}}</v-list-tile-title>
                    <v-list-tile-sub-title>malzeme ismi</v-list-tile-sub-title>
                  </v-list-tile-content>
                  <v-list-tile-content>
                    <v-list-tile-title>{{item.fields.mat_price}}</v-list-tile-title>
                    <v-list-tile-sub-title>malzeme fiyatı</v-list-tile-sub-title>
                  </v-list-tile-content>
                  <v-list-tile-content>
                    <v-list-tile-title>{{item.fields.count}}</v-list-tile-title>
                    <v-list-tile-sub-title>adet</v-list-tile-sub-title>
                  </v-list-tile-content>
                  <v-list-tile-content>
                    <v-list-tile-title>{{moment(item.fields.date).format('LLLL')}}</v-list-tile-title>
                    <v-list-tile-sub-title>eklendiği tarih</v-list-tile-sub-title>
                  </v-list-tile-content>
                  <v-list-tile-content>
                    <v-list-tile-title>{{getMultiple(item.fields.mat_price, item.fields.count)}}</v-list-tile-title>
                    <v-list-tile-sub-title>toplam maaliyet</v-list-tile-sub-title>
                  </v-list-tile-content>
                  <!--
                  <v-spacer></v-spacer>
                  <v-list-tile-content>
                    <template v-if='item.fields.payed'>
                      <v-switch v-model="item.fields.payed" label="Ödendi" :key="item.pk"></v-switch>
                    </template>
                    <template v-else>
                      <v-switch v-model="item.fields.payed" label="Ödenmedi" :key="item.pk"></v-switch>
                    </template>
                  </v-list-tile-content>
                  -->
                </v-list-tile>
              </template>
            </template>
            <template v-else>
              <center>Malzeme Kullanılmadı.</center>
            </template>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="issueUsedMaterialsDialog = false">Kapat</v-btn>
          <!--<v-btn color="blue darken-1" flat @click="updateDebts()">Güncelle</v-btn>-->
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="customerDetectHistoryDialog"
      width="1400"
      height="1500"
    >
      <v-data-table
        :headers="headersHistory"
        :items="customerDetectHistory"
        class="elevation-1"
        hide-actions
      >
        <template v-slot:no-data>
          <v-alert :value="true" color="error" icon="warning">
            Müşteri henüz bir hata tespitinde bulunmadı.
          </v-alert>
        </template>
        <template v-slot:items="props">
          <template v-if='props.item.fields.title.length <= 15'>
            <td class="text-xs-middle">{{ props.item.fields.title }}</td>
          </template>
          <template v-else>
            <td class="text-xs-middle">{{ props.item.fields.title.substring(0,15) }} ... </td>
          </template>
          <template v-if='props.item.fields.content.length <= 15'>
            <td class="text-xs-middle">{{ props.item.fields.content }}</td>
          </template>
          <template v-else>
            <td class="text-xs-middle">{{ props.item.fields.content.substring(0,15) }} ... </td>
          </template>
          <td class="text-xs-middle">{{moment(props.item.fields.date).format('LLLL')}}</td>
          <td class="text-xs-middle">{{props.item.cost}} ₺</td>
          <template v-if='props.item.fields.is_done === true'>
            <td class="text-xs-middle">
              <v-chip color="blue lighten-1">ONARILDI</v-chip>
            </td>
          </template>
          <template v-else>
            <td class="text-xs-middle">
              <v-chip color="red lighten-2">ONARILIYOR</v-chip>
            </td>
          </template>
          <td class="text-xs-middle">
            <v-btn color="success" @click=getUsedMatsForDebt(props.item.pk) >DETAY</v-btn>
          </td>
        </template>
      </v-data-table>
    </v-dialog>

    <v-dialog
      v-model="selectModal"
      width="800"
      height="1500"
    >
      <v-toolbar flat color="white">
        <v-toolbar-title>Müşteri Lokasyonları</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn color="success" dark @click="showAllLocations()">
          Tüm Lokasyonları Görüntüle
        </v-btn>
        <v-btn color="success" dark @click="addNewLocation()">
          Ekle
        </v-btn>
      </v-toolbar>
      <v-list>
        <template v-if="facilities !== []">
          <template v-for="(item, index) in facilities">
            <v-list-tile
              :key="index"
            >
              <v-list-tile-content>
                <v-list-tile-title>{{item.tag}}</v-list-tile-title>
                <v-list-tile-sub-title>lokasyon ismi</v-list-tile-sub-title>
              </v-list-tile-content>
              <v-list-tile-avatar size="80">
                <v-icon x-large @click="locationCustomerBase(item)">map</v-icon>
              </v-list-tile-avatar>
            </v-list-tile>
          </template>
        </template>
        <template v-else>
          <center>Lokasyon bulunamadı.</center>
        </template>
      </v-list>
    </v-dialog>
    <v-dialog
      v-model="fullmapModal"
      fullscreen
    >
      <googlemaps-map
        class="mapall"
        :center.sync="center"
        :zoom.sync="zoom"
      >
        <!-- User Position -->
        <googlemaps-user-position
          @update:position="setUserPosition" />

        <googlemaps-marker
          v-for="(fuck, index) in facilities"
          :title="fuck.tag"
          :key="index"
          :position="{ lat: fuck.facility_location_lat, lng: fuck.facility_location_lon}" />
        <!-- Polyline -->
      </googlemaps-map>
    </v-dialog>
    <v-dialog v-model="addMusteriDialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Yeni Müşteri Ekle</span>
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
            label="Müşterinin Kullanıcı Adı"
            required
          ></v-text-field>
        -->
          <v-text-field
            v-model="first_name"
            :rules="nameRules"
            label="Müşterinin Adı"
            required
          ></v-text-field>
          <v-text-field
            v-model="last_name"
            :rules="nameRules"
            label="Müşterinin Soyadı"
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
            label="Müşterinin TC Kimlik Numarası"
            required
          ></v-text-field>
          <v-text-field
            type="number"
            v-model="limitexpire"
            :rules="nameRules"
            label="Müşterinin Limiti"
            required
          ></v-text-field>
          <v-text-field
            v-model="facility"
            :rules="nameRules"
            label="Firma Adı"
          ></v-text-field>
          <v-card-actions>
            <v-btn color="black darken-2" flat @click="addMusteriDialog = false">Kapat</v-btn>
            <v-btn
              :disabled="!valid"
              color="black darken-2"
              @click="validate"
              :class=" { 'green darken-1 white--text' : valid, disabled: !valid }"
              flat
            >
              Kaydet
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="googleMapDialog"
      width="1500"
      height="1500"
    >
      <v-toolbar flat color="white">
        <v-toolbar-title>Bir Konum Seçiniz</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn color="success" dark @click="addNewLocationSecondStep()">
          İleri
        </v-btn>
      </v-toolbar>
      <googlemaps-map
        class="map"
        :center.sync="center"
        :zoom.sync="zoom"
        @click="onMapClick"
      >
        <!-- User Position -->
        <googlemaps-user-position
          @update:position="setUserPosition" />
          <!-- Marker -->
        <googlemaps-marker
          title="Gonya"
          :draggable="true"
          :position="markedOnClick" />

        <!-- Polyline -->
      </googlemaps-map>
    </v-dialog>
    <v-dialog v-model="giveNameModal" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Yeni Lokasyon İsmi</span>
        </v-card-title>
        <v-form
          style="margin-left: 25px; margin-right: 25px;"
          ref="form1"
          v-model="valid"
          lazy-validation
        >
          <v-text-field
            v-model="newLocationName"
            :rules="nameRules"
            label="Lokasyon İsmi Giriniz"
            required
          ></v-text-field>
          <v-card-actions>
            <v-btn color="black darken-2" flat @click="giveNameModal = false">Kapat</v-btn>
            <v-btn
              :disabled="!valid"
              color="black darken-2"
              @click="validateNewLocation"
              :class=" { 'green darken-1 white--text' : valid, disabled: !valid }"
              flat
            >
              Kaydet
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="debtpaydialog"
      width="500"
      height="1500"
    >
     <v-list>
        <!--<v-btn color="success" @click="csvExport(debtpayhistory)" :key="index">INDIR</v-btn>-->
        <template v-for="(item, index) in debtpayhistory">
          <v-list-tile
            :key="index"
          >
            <v-list-tile-content>
              <v-list-tile-title>{{moment(item.fields.payed_date).format('LLLL')}}</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action style="margin-right: 15px;">
              <v-span>{{item.fields.payed_amount}} ₺</v-span>
            </v-list-tile-action>
          </v-list-tile>
        </template>
      </v-list>
    </v-dialog>

    <v-snackbar
      v-model="noHistorySnack"
      bottom
      left
      :timeout="6000"
    >
      Müşterinin henüz bir geçmişi bulunmamaktadır.
    </v-snackbar>
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
    progreesTable: false,
    limitexpire: 0,
    debtpaydialog: false,
    debtpayhistory: [],
    expiredLimit: false,
    newLocationName: null,
    markedOnClick: { lat: 37.864269, lng: 32.452331 },
    markLocation: { lat: 0, lng: 0 },
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
    /* left */
    googleMapDialog: false,
    changedSomething: true,
    noHistorySnack: false,
    customers: [],
    headers: [
      {
        text: 'Müşteri Kullanıcı Adı',
        align: 'left',
        sortable: false,
        value: 'cst_name'
      },
      { text: 'İsmi', align: 'left', sortable: false, value: 'cst_fname' },
      { text: 'Soyismi', align: 'left', sortable: false, value: 'cst_lname' },
      { text: 'TC Kimlik Numarası', align: 'left', sortable: false, value: 'cst_tc' },
      // { text: 'Sil', align: 'left', sortable: false, value: 'cst_id' },
      { text: 'Lokasyonları', align: 'left', sortable: false, value: 'cst_id' },
      { text: 'Hata Tespit Detay / Tahsilat Geçmişi', align: 'left', sortable: false, value: 'cst_id' },
      { text: 'Ödenen', align: 'left', sortable: true, value: 'payed' },
      { text: 'Borcu', align: 'left', sortable: true, value: 'unpayed' },
      { text: 'Borç Ödeme', align: 'left', sortable: false, value: 'debtpayed' },
      { text: 'Limit', align: 'left', sortable: true, value: 'limit' }
    ],
    headersHistory: [
      { text: 'Başlık', align: 'left', sortable: false, value: 'fields.title' },
      { text: 'Açıklama', align: 'left', sortable: false, value: 'fields.content' },
      { text: 'Tarih', align: 'left', sortable: false, value: 'fields.date' },
      { text: 'Maaliyet', align: 'left', sortable: false, value: 'pk' },
      { text: 'Durumu', align: 'left', sortable: false, value: 'fields.is_done' },
      { text: 'Detay', align: 'left', sortable: false, value: 'pk' }
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
    facility: 'Default',
    fac_lat: 0,
    fac_lon: 0,
    lat: 0,
    lon: 0,
    mapModal: false,
    wantDeleteId: null,
    sureModal: false,
    facilities: [],
    selectModal: false,
    selectedCustomer: null,
    customerinfo: {},
    customerDetectHistory: [],
    customerDetectHistoryDialog: false,
    issueUsedMaterials: [],
    issueUsedMaterialsDialog: false,
    addMusteriDialog: false,
    giveNameModal: false,
    fullmapModal: false
  }),
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
  },
  methods: {
    getCsvDocument (cst) {
      this.progreesTable = true
      this.$parent.$parent.$parent.$parent.loadDialog = true
      this.$http.get(this.$parent.$parent.$parent.$parent.api_base_url + 'customercsv/' + cst.cst_id + '/')
        .then((response) => {
          if (response.status === 200) {
            this.$parent.$parent.$parent.$parent.loadDialog = false
            this.progreesTable = false
            this.csvExport(response.data)
          }
        }).catch((e) => {
          alert(e)
        })
    },
    csvExport (arrData) {
      console.log('arrData :: ', arrData)
      const dataincrese = arrData[1]
      if (dataincrese.length !== 0) {
        console.log('arrData :: ', arrData[0])
        let filename = arrData[0].name + '_' + arrData[0].surname + '.csv'
        let csvContent = 'data:text/csv;charset=utf-8,'
        for (var i = dataincrese.length - 1; i >= 0; i--) {
          dataincrese[i]['Tarih'] = this.moment(dataincrese[i]['Tarih']).format('L') + ' - ' + this.moment(dataincrese[i]['Tarih']).fromNow()
        }
        csvContent += [' ', 'Müşteri ismi : ' + arrData[0].name + arrData[0].surname, ' '].join('\n')
        csvContent += [' ', 'Müşteri limiti : ' + arrData[0].limit, ' '].join('\n')
        csvContent += [
          Object.keys(dataincrese[0]).join(';'),
          ...dataincrese.map(item => Object.values(item).join(';'))
        ]
          .join('\n')
          .replace(/(^\[)|(\]$)/gm, '')

        csvContent += [' ', ' ', 'Ödenen Miktar : ' + arrData[0].payed].join('\n')
        csvContent += [' ', ' ', 'Borcu : ' + arrData[0].unpayed].join('\n')

        const data = encodeURI(csvContent)
        const link = document.createElement('a')
        link.setAttribute('href', data)
        link.setAttribute('download', filename)
        link.click()
      } else {
        this.noHistorySnack = true
      }
    },
    updatelimit (cst) {
      this.progreesTable = true
      this.$parent.$parent.$parent.$parent.loadDialog = true
      this.$http.patch(this.$parent.$parent.$parent.$parent.api_base_url + 'customerlimit/' + cst.cst_id + '/', {
        '_newlimit': cst.limit
      }).then((response) => {
        if (response.status === 200) {
          this.$parent.$parent.$parent.$parent.loadDialog = false
          this.progreesTable = false
          this.getCustomers()
        }
      }).catch((e) => {
        alert(e)
      })
    },
    onMapClick ({ latLng }) {
      var latitudeLong = [latLng.lat(), latLng.lng()]
      this.lat = latLng.lat()
      this.lon = latLng.lng()
      this.markedOnClick = { lat: latLng.lat(), lng: latLng.lng() }
      console.log(latitudeLong)
      // this.googleMapDialog = false
      // this.mapModal = true
      // this.searchLocation = latLng
      // this.$refs.results.$el.scrollTop = 0
    },
    addNewLocationSecondStep () {
      this.googleMapDialog = false
      this.giveNameModal = true
    },
    polylineClicked () {
      console.log('clicked')
      const options = {
        strokeOpacity: Math.random()
      }
      this.options = options
    },
    pathChanged (path) {
      console.log(path)
    },
    centerOnUser () {
      if (this.userPosition) {
        this.center = this.userPosition
      }
    },
    setUserPosition (position) {
      this.userPosition = position
    },
    /* left */
    addNewLocation () {
      this.googleMapDialog = true
      console.log('selectedCustomerselectedCustomer ', this.selectedCustomer)
    },
    handleThis (p) {
      if (p === '0') {
        this.changedSomething = true
      } else {
        this.changedSomething = false
      }
    },
    openAddMusteriDialog () {
      this.addMusteriDialog = true
    },
    getFuck (e) {
      console.log('EEE ', e.get('coords'))
    },
    getMultiple (x, y) {
      return x * y
    },
    showAllLocations () {
      this.fullmapModal = true
    },
    setFacilitiesCustomer (cst) {
      this.selectedCustomer = cst
      this.facilities = cst.facilities
      this.selectModal = true
    },
    locationCustomerBase (customer) {
      this.lat = customer.facility_location_lat
      this.lon = customer.facility_location_lon
      this.markLocation = { lat: this.lat, lng: this.lon }
      this.customerinfo = {
        header: customer.tag,
        body: this.selectedCustomer.cst_fname + ' ' + this.selectedCustomer.cst_lname,
        footer: ''
      }
      this.selectModal = false
      this.mapModal = true
    },
    wantDeleteModal (e) {
      this.wantDeleteId = e
      this.sureModal = true
    },
    deleteCustomer () {
      this.$http.delete(this.$parent.$parent.$parent.$parent.api_base_url + 'customers/' + this.wantDeleteId + '/')
        .then((response) => {
          if (response.status === 200) {
            this.sureModal = false
            this.getCustomers()
          }
        }).catch((e) => {
          alert(e)
        })
    },
    validate () {
      if (this.$refs.form.validate()) {
        this.addNewCustomer()
      }
    },
    validateNewLocation () {
      if (this.$refs.form1.validate()) {
        this.addNewLocationPost()
      }
    },
    addNewLocationPost () {
      this.selectModal = false
      this.giveNameModal = false
      this.$parent.$parent.$parent.$parent.loadDialog = true
      this.$http.post(this.$parent.$parent.$parent.$parent.api_base_url + 'cst_facilities/', {
        cst_id: this.selectedCustomer.cst_id,
        tag: this.newLocationName,
        latitude: this.markedOnClick.lat,
        longitude: this.markedOnClick.lng
      }).then((response) => {
        if (response.status === 200) {
          this.$parent.$parent.$parent.$parent.loadDialog = false
          this.getCustomers()
        }
      }).catch((e) => {
        alert(e)
      })
      console.log('<> ', this.selectedCustomer)
      console.log('> ', this.newLocationName, ' <> ', this.markedOnClick)
    },
    getDebtsOfCustomer (cst) {
      this.$http.get(this.$parent.$parent.$parent.$parent.api_base_url + 'customerdebts/' + cst.cst_id + '/')
        .then((response) => {
          this.customerDetectHistory = response.body
          console.log('this.customerDetectHistory :: ', this.customerDetectHistory)
          this.customerDetectHistoryDialog = true
          /*
          for item in serialized_obj:
            corp_iss = CorporationIssues.objects.filter(issue_id=item["pk"]).last()
            usd_mats = corp_iss.used_materials.all()
            data = serializers.serialize('json', usd_mats)
          */
        })
        .catch((e) => {
          if (e.status === 400) {
            this.noHistorySnack = true
          }
        })
    },
    getDebtsHistoryOfCustomer (cst) {
      this.$http.get(this.$parent.$parent.$parent.$parent.api_base_url + 'customerdebthistory/' + cst.cst_id + '/')
        .then((response) => {
          console.log('repsoe :D:D:', response.body)
          this.debtpayhistory = response.body
          this.debtpaydialog = true
          //  fields.payed_amount
          //  fields.payed_date
          // this.customerDetectHistory = response.body
          // this.customerDetectHistoryDialog = true
        })
        .catch((e) => {
          if (e.status === 400) {
            this.noHistorySnack = true
          }
        })
    },
    getUsedMatsForDebt (pk) {
      this.$http.get(this.$parent.$parent.$parent.$parent.api_base_url + 'customerdebtsdetail/' + pk + '/')
        .then((response) => {
          this.issueUsedMaterials = response.body
          this.issueUsedMaterialsDialog = true
          console.log('RR¶¶ :: ', response.body)
        })
    },
    updateDebtsForEach () {
      this.$parent.$parent.$parent.$parent.loadDialog = true
      var customersIdWithPays = []
      for (var i = this.customers.length - 1; i >= 0; i--) {
        customersIdWithPays.push({
          _id: this.customers[i].cst_id,
          _pay: parseInt(this.customers[i].debtpayed)
        })
      }
      this.$http.patch(this.$parent.$parent.$parent.$parent.api_base_url + 'customerdebtpayed/', {
        '_pays': customersIdWithPays
      }).then((response) => {
        if (response.status === 200) {
          this.$parent.$parent.$parent.$parent.loadDialog = false
          this.getCustomers()
        }
      }).catch((e) => {
        alert(e)
      })
    },
    updateDebts () {
      this.issueUsedMaterialsDialog = false
      this.customerDetectHistoryDialog = false
      this.$parent.$parent.$parent.$parent.loadDialog = true
      this.$http.post(this.$parent.$parent.$parent.$parent.api_base_url + 'customerdebtpayed/', {
        '_fuckyou': this.issueUsedMaterials
      }).then((response) => {
        if (response.status === 200) {
          this.$parent.$parent.$parent.$parent.loadDialog = false
          this.getCustomers()
        }
      }).catch((e) => {
        alert(e)
      })
    },
    addNewCustomer () {
      this.addMusteriDialog = false
      this.$parent.$parent.$parent.$parent.loadDialog = true
      this.$http.put(this.$parent.$parent.$parent.$parent.api_base_url + 'customers/', {
        // username: this.username,
        limit: this.limitexpire,
        email: this.email,
        password: this.password,
        first_name: this.first_name,
        last_name: this.last_name,
        tc_no: this.tc_no,
        facility: this.facility
      }).then((response) => {
        if (response.status === 200) {
          this.$store.commit('decreaseDeviceCount')
          this.$parent.$parent.$parent.$parent.loadDialog = false
          this.getCustomers()
        }
      }).catch((e) => {
        this.$parent.$parent.$parent.$parent.loadDialog = false
        this.expiredLimit = true
      })
    },
    getCustomers () {
      this.$http.get(this.$parent.$parent.$parent.$parent.api_base_url + 'customers/')
        .then((response) => {
          if (response.status === 200) {
            if (response.body !== []) {
              this.customers = response.body
              for (var i = this.customers.length - 1; i >= 0; i--) {
                this.customers[i].debtpayed = 0
              }
            }
          }
        }).catch((e) => {
          alert(e)
        })
    }
  },
  beforeCreate () {
    this.$http.get(this.$parent.$parent.$parent.$parent.api_base_url + 'customers/')
      .then((response) => {
        if (response.status === 200) {
          if (response.body !== []) {
            console.log('response.body :: ', response.body)
            this.customers = response.body
            for (var i = this.customers.length - 1; i >= 0; i--) {
              this.customers[i].debtpayed = 0
            }
          }
        }
      }).catch((e) => {
        alert(e)
      })
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
  width: 1500px;
  height: 1500px;
}
.mapall {
  flex: 100% 1 1;
  width: 100%;
  height: 100%;
}
</style>
