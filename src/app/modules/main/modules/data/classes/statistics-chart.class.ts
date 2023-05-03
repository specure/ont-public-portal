import { Chart, ChartDataset } from 'chart.js'
import { StatisticsChartOptions } from './statistics-chart-options.class'

export class StatisticsChart extends Chart {
  constructor(context: CanvasRenderingContext2D, datasets: ChartDataset[]) {
    super(context, {
      type: 'bar',
      data: {
        labels: [],
        datasets,
      },
      options: new StatisticsChartOptions(),
    })
  }
}
