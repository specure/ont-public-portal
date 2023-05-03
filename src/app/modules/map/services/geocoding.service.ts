import { Injectable } from '@angular/core'
import { forkJoin, Observable, of } from 'rxjs'
import { environment } from 'src/environments/environment'
import { catchError, map } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http'
import { IGeocodingResponse } from '../interfaces/geocoding-response.interface'
import { IGeocodingFeature } from '../interfaces/geocoding-feature.interface'

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private url: string

  constructor(
    private http: HttpClient
  ) {
    const { center, geocoding } = environment.map
    this.url = geocoding.url
      .replace('{center}', `${center[0]},${center[1]}`)
  }

  getLocationsFromQuery = (address: string): Observable<IGeocodingFeature[]> => {
    if (!address || typeof address !== 'string') {
      return of(null)
    }
    const simpleUrl = this.url
      .replace('{query}', address)
    const cityUrl = this.url
      .replace('q={query}', 'qq={query}')
      .replace('{query}', `city=${address}`)
    const countyUrl = this.url
      .replace('q={query}', 'qq={query}')
      .replace('{query}', `county=${address}`)
    return forkJoin([
      this.http.get(simpleUrl),
      this.http.get(cityUrl),
      this.http.get(countyUrl)
    ])
      .pipe(
        map((
          [simpleResults, countryResults, countyResults]: [IGeocodingResponse, IGeocodingResponse, IGeocodingResponse]
        ) => {
          const items = [...countyResults.items, ...countryResults.items, ...simpleResults.items]
          const reducedItems = items.reduce((acc, item) => {
            return acc.some((e) => e.title === item.title) ? acc : [...acc, item]
          }, [])
          return reducedItems ? reducedItems : null
        }),
        catchError((err) => {
          console.log(err)
          return of(null)
        })
      )
  }
}
