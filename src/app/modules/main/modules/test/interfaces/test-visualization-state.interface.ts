import { ITestItemState } from './test-item-state.interface'

export interface ITestVisualizationState {
  download: ITestItemState,
  downloadInit: ITestItemState,
  ping: ITestItemState,
  upload: ITestItemState
  uploadInit: ITestItemState,

  extendChart?(key: 'download' | 'upload', counter: string | number, progress: number): {x: number, y: number}[]
}
