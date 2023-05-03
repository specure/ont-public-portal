import { IGeocodingFeature } from './geocoding-feature.interface'

export interface IGeocodingResponse {
  items: IGeocodingFeature[],
}
