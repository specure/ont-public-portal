export class StatisticsChartOptions {
  animation = { duration: 0 }
  barLabels: string[][] = []
  cornerRadius = 20
  maintainAspectRatio = false
  layout = {
    padding: {
      left: 120,
    },
  }
  indexAxis = 'y' as const
  scales = {
    y: {
      border: {
        display: false,
      },
      grid: {
        display: false,
      },
      ticks: {
        color: '#212222',
        font: {
          size: 14,
        },
        mirror: true,
        padding: -43,
      },
    },
    x: {
      beginAtZero: true,
      border: {
        display: false,
      },
      grid: {
        color: 'rgba(0,32,91,0.25)',
      },
      max: 0,
      ticks: {
        color: 'rgba(0,32,91,0.5)',
        padding: 24,
        stepSize: 1,
        callback: (val) => val.toLocaleString(),
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

  constructor() {}
}
