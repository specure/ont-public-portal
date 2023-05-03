import { ITestVisualizationState } from '../interfaces/test-visualization-state.interface'
import { ITestItemState } from '../interfaces/test-item-state.interface'

export class TestVisualizationState implements ITestVisualizationState {
  download: ITestItemState
  downloadInit: ITestItemState
  ping: ITestItemState
  upload: ITestItemState
  uploadInit: ITestItemState

  extendChart(key: 'download' | 'upload', counter: string | number, progress: number) {
    return [...this[key]?.chart || [], {
      x: progress,
      y: counter === '-' ? 0 : counter as number
    }]
  }
}
