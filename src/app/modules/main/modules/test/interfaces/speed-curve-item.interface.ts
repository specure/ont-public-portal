export type TestPhase = 'download' | 'upload'

export interface ISpeedCurveItem {
  bytes_total: number
  time_elapsed: number
  speed: number
}

export interface ISpeedCurveResponse {
  speed_curve: {
    [K in TestPhase]: ISpeedCurveItem[]
  }
}
