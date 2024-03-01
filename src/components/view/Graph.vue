<script>
import { Line } from 'vue-chartjs'

export default {
  extends: Line,
  props: {
    source: {
      type: Object,
      required: true
    },
    sourceType: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      dataset: [],
      axisId: 0,
      graphOptions: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 0
        },
        legend: {
          display: false
        },
        title: {
          display: false
        },
        scales: {
          xAxes: [
            {
              type: 'time',
              time: {
                round: true,
                displayFormats: {
                  'second': 'HH:mm:ss',
                }
              },
              Distribution: 'linear',
              ticks: {
                source: 'auto',
                maxRotation: 70,
                minRotation: 70,
                min: null,
                max: null
              }
            }
          ],
        }
      }
    }
  },
  watch: {
    source: function() {
      this.changeBgColor('#EEEEEE')
    }
  },
  mounted() {
    this.changeBgColor('#EEEEEE')
  },
  methods: {
    changeBgColor(color) {
      this.addPlugin({
        beforeDraw: function (c) {
          var ctx = c.chart.ctx
          ctx.fillStyle = color
          ctx.fillRect(0, 0, c.chart.width, c.chart.height)
        }
      }),
      this.renderGraph()
    },
    renderGraph() {
      this.dataset = []

      // 第2軸のみ
      if (!this.sourceType.main && this.sourceType.sub) {
        this.dataset.push({
          yAxisID: 'y-0',
          backgroundColor: 'black',
          borderColor: '#27ae60',
          pointBackgroundColor: '#27ae60',
          fill: false,
          lineTension: 0,
          data: this.source.sub
        })

        this.graphOptions.scales.yAxes = [
          {
            id: 'y-0',
            position: 'right',
            ticks: {
              source: 'auto',
              beginAtZero: false,
              fontColor: '#27ae60'
            }
          }
        ]

      // 両軸
      }else if (this.sourceType.main && this.sourceType.sub) {
        this.dataset.push({
          yAxisID: 'y-0',
          backgroundColor: 'black',
          borderColor: '#333',
          pointBackgroundColor: '#333',
          fill: false,
          lineTension: 0,
          data: this.source.main
        },
        {
          yAxisID: 'y-1',
          backgroundColor: 'black',
          borderColor: '#27ae60',
          pointBackgroundColor: '#27ae60',
          fill: false,
          lineTension: 0,
          data: this.source.sub
        })

        this.graphOptions.scales.yAxes = [
          {
            id: 'y-0',
            position: 'left',
            ticks: {
              source: 'auto',
              beginAtZero: false,
              fontColor: '#333'
            }
          },
          {
            id: 'y-1',
            position: 'right',
            ticks: {
              source: 'auto',
              beginAtZero: false,
              fontColor: '#27ae60'
            }
          }
        ]

      // 主軸のみ or データなし
      }else {
        this.dataset.push({
          yAxisID: 'y-0',
          backgroundColor: 'black',
          borderColor: '#333',
          pointBackgroundColor: '#333',
          fill: false,
          lineTension: 0,
          data: this.source.main
        })
        
        this.graphOptions.scales.yAxes = [
          {
            id: 'y-0',
            position: 'left',
            ticks: {
              source: 'auto',
              beginAtZero: false,
              fontColor: '#333'
            }
          }
        ]
      }

      this.renderChart({
        datasets: this.dataset
      }, this.graphOptions)
    }
  }
}
</script>
