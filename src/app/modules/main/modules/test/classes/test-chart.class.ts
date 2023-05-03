import { TestChartDataset } from './test-chart-dataset.class'
import { TestChartOptions } from './test-chart-options.class'
import { ITestItemState } from '../interfaces/test-item-state.interface'
import { Chart } from 'chart.js'

export class TestChart extends Chart {
  private finished = false

  constructor(
    private context: CanvasRenderingContext2D,
    label: string,
    units: string
  ) {
    super(context, {
      type: 'line',
      data: {
        datasets: [new TestChartDataset(context)],
        labels: Array(100)
          .fill(0)
          .map((_, idx) => 0 + idx),
      },
      options: new TestChartOptions(units),
    })
  }

  resetData() {
    this.data.datasets = [new TestChartDataset(this.context)]
    this.data.labels = []
    this.finished = false
    this.update()
  }

  setData(data: ITestItemState) {
    this.data.datasets = [new TestChartDataset(this.context)]
    this.data.datasets[0].data = this.getAllData(data)
    this.finished = true
    this.update()
  }

  updateData(data: ITestItemState) {
    const lastData = this.getLastData(data)
    if (!this.finished) {
      this.data.datasets[0].data.push(lastData)
      this.update()
    }
    this.finished = lastData.x >= 100
  }

  private getAllData(testItem: ITestItemState) {
    return testItem && testItem.chart.length ? testItem.chart : []
  }

  private getLastData(testItem: ITestItemState) {
    return testItem && testItem.chart.length
      ? testItem.chart[testItem.chart.length - 1]
      : null
  }
}
