<template>
  <v-container fluid grid-list-md fill-height >
    <v-layout align-space-around>
      <v-flex xs4>
        <v-card>
          <v-card-title primary-title>
            <div>
              <h3 class="headline mb-0">Yeni Malzeme Ekle</h3>
            </div>
          </v-card-title>
          <v-form
            style="margin-left: 25px; margin-right: 25px;"
            ref="form"
            v-model="valid"
            lazy-validation
          >
            <v-text-field
              v-model="mtr"
              :rules="nameRules"
              label="Malzemenin Adı"
              required
            ></v-text-field>
            <v-text-field
              label="Fiyatı"
              type="number"
              :rules="priceRules"
              v-model="price"
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
      <!--
        sm3 offset-sm0
        sm6 offset-sm1
      -->
      <v-flex xs8 >
        <v-data-table
          :headers="headers"
          :items="materials"
          class="elevation-1"
          hide-actions
        >
          <template v-slot:no-data>
            <v-alert :value="true" color="error" icon="warning">
              Henüz bir malzemeniz bulunmamaktadır.
            </v-alert>
          </template>
          <template v-slot:items="props">
            <td>{{ props.item.material_name }}</td>
            <td class="text-xs-middle">{{ props.item.material_price }}</td>
            <td class="text-xs-middle">{{moment(props.item.material_created_date).format('LLLL')}}</td>
            <td class="text-xs-middle"><v-btn color="error" @click=sureDialog(props.item.material_id) >Sil</v-btn></td>
          </template>
        </v-data-table>
      </v-flex>
    </v-layout>
    <v-dialog
      v-model="dialog"
      max-width="290"
    >
      <v-card>
        <v-card-title class="headline">Emin misiniz?</v-card-title>

        <v-card-text>
          Bu malzemeyi silmek ilgili hata raporlarını da etkileyecektir.
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            color="green darken-1"
            flat="flat"
            @click="dialog = false"
          >
            İptal
          </v-btn>

          <v-btn
            color="green darken-1"
            flat="flat"
            @click="deleteMtr()"
          >
            Sil
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    selectedMatId: null,
    dialog: false,
    headers: [
      {
        text: 'Malzeme Adı',
        align: 'left',
        sortable: false,
        value: 'material_name'
      },
      { text: 'Fiyatı', value: 'material_price' },
      { text: 'Eklendiği Tarih', value: 'material_created_date' },
      { text: 'Sil', sortable: false, value: 'material_id' }
    ],
    price: 0,
    items: [
      {title: 'Malzeme Ekle', to: '/dashboard/materials/add/', icon: 'add'}
    ],
    materials: [],
    valid: true,
    mtr: '',
    nameRules: [
      v => !!v || 'Zorunlu alan'
    ],
    priceRules: [
      v => !!v || 'Zorunlu alan'
    ]
  }),
  methods: {
    sureDialog (mtrid) {
      this.selectedMatId = mtrid
      this.dialog = true
    },
    deleteMtr () {
      this.$http.delete(this.$parent.$parent.$parent.$parent.api_base_url + 'materials/' + this.selectedMatId + '/')
        .then((response) => {
          if (response.status === 200) {
            this.getMaterials()
          }
        }).catch((e) => {
          alert(e)
        })
      this.dialog = false
    },
    validate () {
      if (this.$refs.form.validate()) {
        this.addNewMaterial()
      }
    },
    addNewMaterial () {
      this.$http.put(this.$parent.$parent.$parent.$parent.api_base_url + 'materials/', {
        price: this.price,
        name: this.mtr
      }).then((response) => {
        if (response.status === 200) {
          this.getMaterials()
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
              this.materials = response.body
            }
          }
        }).catch((e) => {
          alert(e)
        })
    }
  },
  beforeCreate () {
    this.$http.get(this.$parent.$parent.$parent.$parent.api_base_url + 'materials/')
      .then((response) => {
        if (response.status === 200) {
          if (response.body !== []) {
            this.materials = response.body
          }
        }
      }).catch((e) => {
        alert(e)
      })
  }
  /*
  components: {
    'vuetify-image-input': VImageInput
  }
  */
}
</script>
