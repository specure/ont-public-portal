import { Injectable } from '@angular/core'
import { IGeocodingService } from '../interfaces/geocoding-service.interface'
import { IGeocodingFeature } from '../interfaces/geocoding-feature.interface'
import { catchError, concatMap, from, map, Observable, of, tap } from 'rxjs'
import { Loader } from '@googlemaps/js-api-loader'
import { environment } from 'src/environments/environment'
import { TranslocoService } from '@ngneat/transloco'

@Injectable({
  providedIn: 'root',
})
export class GooglePlacesService implements IGeocodingService {
  private loader: Loader

  constructor(private readonly transloco: TranslocoService) {
    this.loader = new Loader({
      apiKey: environment.map.geocoding.apiKey,
      version: 'weekly',
    })
  }

  getLocationsFromQuery = (
    address: string
  ): Observable<IGeocodingFeature[]> => {
    if (!address || typeof address !== 'string') {
      return of(null)
    }
    return from(this.loader.importLibrary('places')).pipe(
      concatMap(({ Place }) => {
        const request = {
          textQuery: address,
          fields: ['displayName', 'location'],
          includedType: '', // Restrict query to a specific type (leave blank for any).
          useStrictTypeFiltering: true,
          language: this.transloco.getActiveLang().replace(/_[A-Z]+/, ''), // sr_ME-Latn is not supported by Google Places API
          maxResultCount: environment.map.geocoding.limit,
          minRating: 1, // Specify a minimum rating.
          region: environment.map.geocoding.region,
        }
        return from(Place.searchByText(request))
      }),
      tap(console.log),
      map(({ places }) => {
        if (!places || places.length === 0) {
          return null
        }
        return places.map((place) => {
          return {
            id: place.id,
            title: place.displayName,
            position: {
              lat: place.location.lat(),
              lng: place.location.lng(),
            },
            resultType: 'locality',
          }
        })
      }),
      catchError(() => of(null))
    )
  }
}
