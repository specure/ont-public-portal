import { IHistoryTableItem } from '../../../interfaces/history-table.interface'
import { ITestResult } from '../interfaces/test-result.interface'

export class HistoryTableItem implements IHistoryTableItem {
  browserName: string
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

  static fromLocalHistoryItem(result: ITestResult): IHistoryTableItem {
    return Object.assign(new HistoryTableItem(), {
      browserName: result.client_name || 'Unknown',
      measurementDate: result.time,
      clientProvider: result.client_provider || 'Unknown',
      clientUuid: result.client_uuid || '',
      download: result.test_speed_download,
      upload: result.test_speed_upload,
      ping: Math.round(result.ping_median / 1e6),
      openTestUuid: result.test_uuid,
      operator: result.network_operator || 'Unknown',
      networkType: result.network_type || 'Unknown',
      graphHour: 0,
      jitter: 0,
      packageName: '',
      packetLoss: 0,
      probeId: '',
      serverType: '',
    })
  }

  constructor(data?: Partial<IHistoryTableItem>) {
    if (data) {
      Object.assign(this, data)
    }
  }
}
