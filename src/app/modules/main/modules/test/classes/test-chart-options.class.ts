import { EColors } from 'src/app/core/enums/colors.enum'

export class TestChartOptions {
  animation = {
    duration: 0,
  }
  layout = {
    padding: {
      left: 0,
      right: 0,
    },
  }
  maintainAspectRatio = false
  normalized = true
  parsing: false = false
  scales = {
    x: {
      grid: {
        display: false,
      },
      title: {
        display: true,
        color: EColors.SECONDARY_50,
        font: {
          size: 12,
        },
      },
      ticks: {
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      minRotation: 0,
      maxRotation: 0,
      grid: {
        color: EColors.SECONDARY_10,
      },
      title: {
        display: true,
        color: EColors.SECONDARY_50,
        font: {
          size: 12,
        },
        labelString: 'Mbps',
      },
      position: 'right',
      ticks: {
        color: EColors.SECONDARY_50,
        font: {
          size: 12,
        },
        maxTicksLimit: 6,
        stepSize: 1,
      },
    },
  }
  plugins = {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: false,
    },
  }

  constructor(yLabel: string) {
    this.scales.y.title.labelString = yLabel
  }
}
