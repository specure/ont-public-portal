import { Observable } from 'rxjs'
import { IGeocodingFeature } from './geocoding-feature.interface'

export interface IGeocodingService {
  getLocationsFromQuery(address: string): Observable<IGeocodingFeature[]>
}
