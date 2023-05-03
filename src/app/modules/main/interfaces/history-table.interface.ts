export interface IHistoryTableItem {
  clientProvider: string
  clientUuid: string
  download: number
  graphHour: number
  jitter: number
  measurementDate: string
  networkType: string
  openTestUuid: string
  operator: string
  packageName: string
  packetLoss: number
  ping: number
  probeId: string
  serverType: string
  upload: number
}
