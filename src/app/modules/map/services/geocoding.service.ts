import { Injectable } from '@angular/core'
import { IGeocodingService } from '../interfaces/geocoding-service.interface'
import { Observable } from 'rxjs'
import { IGeocodingFeature } from '../interfaces/geocoding-feature.interface'
import { HereApiService } from './here-api.service'
import { GooglePlacesService } from './google-places.service'
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root',
})
export class GeocodingService implements IGeocodingService {
  private service: IGeocodingService

  constructor(
    private readonly googlePlacesService: GooglePlacesService,
    private readonly hereApiService: HereApiService
  ) {
    if (environment.map.geocoding.provider === 'google') {
      this.service = this.googlePlacesService
    } else {
      this.service = this.hereApiService
    }
  }

  getLocationsFromQuery = (
    address: string
  ): Observable<IGeocodingFeature[]> => {
    return this.service.getLocationsFromQuery(address)
  }
}
