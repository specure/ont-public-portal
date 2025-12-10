import { getBrowserName } from 'src/app/modules/shared/util/platform'
import { ITestResult } from '../interfaces/test-result.interface'
import { ITestState } from '../interfaces/test-state.interface'

export class TestResult implements ITestResult {
  client_language: string
  client_name: string
  client_provider: string
  client_uuid: string
  client_version: string
  device: string
  geoLocations: {
    accuracy: number
    altitude: number
    bearing: number
    geo_lat: number
    geo_long: number
    provider: string
    speed: number
    tstamp: string
  }[]
  ip_address: string
  jpl: string
  loop_uuid: string
  measurement_server_id: number
  measurement_server_name: string
  model: string
  network_operator: string
  network_type: string
  num_threads_ul: number
  open_test_uuid: string
  ping_median: number
  pings: {
    value: number
    value_server: number
    time_ns: number
  }[]
  platform: string
  product: string
  signal_strength: number
  signals: string
  speed_curve?: {
    download: {
      x: number
      y: number
    }[]
    upload: {
      x: number
      y: number
    }[]
  }
  speed_detail?: {
    bytes: number
    direction: 'download' | 'upload'
    thread: number
    time: number
  }[]
  speed_download: number
  speed_upload: number
  tag: string
  telephony_network_country: string
  telephony_network_sim_country: string
  test_bytes_download: number
  test_bytes_upload: number
  test_duration_download: number
  test_duration_upload: number
  test_uuid: string
  test_encryption: string
  test_if_bytes_download: number
  test_if_bytes_upload: number
  test_ip_local: string
  test_ip_server: string
  test_nsec_download: number
  test_nsec_upload: number
  test_num_threads: number
  test_ping_shortest: number
  test_port_remote: number
  test_speed_download: number
  test_speed_upload: number
  test_token: string
  test_total_bytes_download: number
  test_total_bytes_upload: number
  testdl_if_bytes_download: number
  testdl_if_bytes_upload: number
  testul_if_bytes_download: number
  testul_if_bytes_upload: number
  timezone: string
  token: string
  type: string
  user_server_selection: number
  version_code: string
  voip_result_jitter: string
  voip_result_packet_loss: string
  time: string
  vpn_active: boolean

  static fromTestState(testState: Partial<ITestState>): ITestResult {
    return Object.assign(new TestResult(), {
      test_uuid: testState.info.testUuid,
      test_speed_download:
        (testState.visualization.download.counter as number) * 1e3,
      test_speed_upload:
        (testState.visualization.upload.counter as number) * 1e3,
      ping_median: (testState.visualization.ping.counter as number) * 1e6,
      ip_address: testState.info.remoteIp,
      client_name: getBrowserName(),
      client_provider: testState.info.providerName,
      client_uuid: testState.info.clientUuid,
      measurement_server_name: testState.info.serverName,
      time: new Date().toISOString(),
      speed_curve: {
        download: testState.visualization.download.chart,
        upload: testState.visualization.upload.chart,
      },
    } as Partial<ITestResult>)
  }

  constructor(data?: Partial<ITestResult>) {
    if (data) {
      Object.assign(this, data)
    }
  }
}
