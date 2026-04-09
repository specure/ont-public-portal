import {IProvider} from './provider.interface'

export interface IRawProvider {
  id: number
  rawName?: string
  country?: string
  provider?: IProvider
  mobileNetworkOperator?: boolean
  mccMnc?: string
  asn?: string
}
