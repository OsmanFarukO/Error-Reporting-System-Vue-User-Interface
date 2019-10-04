<template>
  <div>
    <v-container fluid grid-list-md fill-height >
      <v-layout align-space-around>
        <v-flex xs6>
          <v-card>
            <GChart
              :settings="{packages: ['line']}"
              :data="chartData"
              :createChart="(el, google) => new google.charts.Line(el)"
              @ready="onChartReady"
              style="width: 900px; height: 400px;"
            />
          </v-card>
          <!--
            :options="chartOptions"
          -->
        </v-flex>
        <v-flex xs6>
          <v-card>
            <GChart
              :settings="{packages: ['line']}"
              :data="corporationChartData"
              :createChart="(el, google) => new google.charts.Line(el)"
              @ready="onChartReady"
              style="width: 900px; height: 400px;"
            />
          </v-card>
          <!--
            :options="chartOptions"
          -->
        </v-flex>
      </v-layout>
    </v-container>
    <v-container fluid grid-list-md fill-height >
      <v-layout align-space-around>
        <v-flex xs4>
          <v-card>
            <v-data-table
              :headers="cstHeaders"
              :items="customerTable"
              class="elevation-1"
              :rows-per-page-items=[10]
            >
              <template v-slot:no-data>
                <v-alert :value="true" color="error" icon="warning">
                  Henüz Hata Raporu Almadınız.
                </v-alert>
              </template>
              <template v-slot:items="props">
                <td>{{ props.item.username }}</td>
                <td class="text-xs-middle">{{ props.item.count }}</td>
              </template>
            </v-data-table>
          </v-card>
        </v-flex>
        <v-flex xs4>
          <v-card>
            <v-data-table
              :headers="empHeader"
              :items="empTable"
              class="elevation-1"
              :rows-per-page-items=[10]
            >
              <template v-slot:no-data>
                <v-alert :value="true" color="error" icon="warning">
                  Henüz Çalışanlarınız Bir İş Tamamlamadı.
                </v-alert>
              </template>
              <template v-slot:items="props">
                <td>{{ props.item.fullname }}</td>
                <td class="text-xs-middle">{{ props.item.done_jobs }}</td>
              </template>
            </v-data-table>
          </v-card>
        </v-flex>
        <v-flex xs4>
          <v-card>
            <v-data-table
              :headers="matHeader"
              :items="matsTable"
              class="elevation-1"
              :rows-per-page-items=[10]
            >
              <template v-slot:no-data>
                <v-alert :value="true" color="error" icon="warning">
                  Henüz Kullanılan Malzemeniz Bulunmamaktır.
                </v-alert>
              </template>
              <template v-slot:items="props">
                <td>{{ props.item.mat_name }}</td>
                <td class="text-xs-middle">{{ props.item.total }}</td>
              </template>
            </v-data-table>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>
<script>
import { GChart } from 'vue-google-charts'

export default {
  data: () => {
    return {
      cstHeaders: [
        {
          text: 'Müşteri İsmi',
          align: 'left',
          sortable: false,
          value: 'username'
        },
        { text: 'Hata Tespit Sayısı', value: 'count' }
      ],
      empHeader: [
        {
          text: 'Çalışan İsmi',
          align: 'left',
          sortable: false,
          value: 'fullname'
        },
        { text: 'Tamamlanan İş Sayısı', value: 'done_jobs' }
      ],
      matHeader: [
        {
          text: 'Malzeme İsmi',
          align: 'left',
          sortable: false,
          value: 'mat_name'
        },
        { text: 'Kullanım Sayısı', value: 'total' }
      ],
      customerTable: [],
      empTable: [],
      matsTable: [],
      issues_byday: [],
      chartsLib: null,
      chartData: [
        ['Bildirim Sayısı', 'Gelen', 'Onarılan'],
        ['06-01', 3, 13],
        ['06-02', 4, 4],
        ['06-03', 1, 11],
        ['06-04', 56, 6],
        ['06-05', 23, 2],
        ['06-06', 6, 26],
        ['06-07', 3, 30],
        ['06-08', 2, 21],
        ['06-09', 35, 35]
      ],
      corporationChartData: [
        ['Bildirim Sayısı', 'Gelen', 'Onarılan'],
        ['06-01', 13, 13],
        ['06-02', 4, 4],
        ['06-03', 11, 11],
        ['06-04', 6, 6],
        ['06-05', 2, 2],
        ['06-06', 26, 26],
        ['06-07', 30, 30],
        ['06-08', 21, 21],
        ['06-09', 35, 35]
      ]
    }
  },
  components: {
    GChart
  },
  methods: {
    onChartReady (chart, google) {
      this.chartsLib = google
    },
    getIssues () {
      this.$http.get(this.$parent.$parent.$parent.$parent.api_base_url + 'cstiss_opt/')
        .then((response) => {
          if (response.status === 200) {
            if (response.body !== []) {
              this.issues = response.body
            }
          }
        }).catch((e) => {
          alert(e)
        })
    },
    getDayParsedIssueCounts () {
      this.$http.get(this.$parent.$parent.$parent.$parent.api_base_url + 'admin_statistics/')
        .then((response) => {
          if (response.status === 200) {
            if (response.body !== []) {
              this.issues_byday = response.body
              for (var i = this.issues_byday.cst_issue_count_day.length - 1; i >= 0; i--) {
                this.chartData.push([this.issues_byday.cst_issue_count_day[i].date, this.issues_byday.cst_issue_count_day[i].count])
              }
              for (i = this.issues_byday.attached_byday.length - 1; i >= 0; i--) {
                this.corporationChartData.push([this.issues_byday.attached_byday[i].date, this.issues_byday.attached_byday[i].count])
              }

              for (i = this.chartData.length - 1; i > 0; i--) {
                for (var j = this.corporationChartData.length - 1; j >= 0; j--) {
                  if (this.chartData[i][0] === this.corporationChartData[j][0]) {
                    this.chartData[i][2] = this.corporationChartData[j][1]
                  }
                }
                if (this.chartData[i].length === 2) {
                  this.chartData[i][2] = 0
                }
              }

              this.customerTable = this.issues_byday.cst_count
              this.empTable = this.issues_byday.emp_with_done
              this.matsTable = this.issues_byday.materials_with_count
              localStorage.setItem('leftdeviceCount', this.issues_byday.deviceoptions[0] - this.issues_byday.deviceoptions[1])
              this.$store.commit('setDefaultLeft', {
                devicecount: this.issues_byday.deviceoptions[0] - this.issues_byday.deviceoptions[1]
              })
              this.$store.commit('setDeviceLimit', {
                limit: this.issues_byday.deviceoptions[0]
              })
              // decreaseDeviceCount
            }
          }
        }).catch((e) => {
          alert(e)
        })
    }
  },
  created () {
    this.getIssues()
    this.getDayParsedIssueCounts()
  }
}
</script>
