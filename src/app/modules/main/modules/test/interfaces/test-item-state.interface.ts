import { ETestStatuses } from '../enums/test-statuses.enum'

export interface ITestItemState {
  chart?: { x: number, y: number }[],
  counter?: string | number,
  container?: ETestStatuses,
  label?: string,
  progress: number,
  time?: number
}
