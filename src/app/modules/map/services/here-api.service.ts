import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { catchError, forkJoin, map, Observable, of } from 'rxjs'
import { environment } from 'src/environments/environment'
import { IGeocodingFeature } from '../interfaces/geocoding-feature.interface'
import { IGeocodingResponse } from '../interfaces/geocoding-response.interface'
import { IGeocodingService } from '../interfaces/geocoding-service.interface'

@Injectable({
  providedIn: 'root',
})
export class HereApiService implements IGeocodingService {
  private url: string

  constructor(private http: HttpClient) {
    const { center, geocoding } = environment.map
    this.url = `${geocoding.url?.replace(
      '{center}',
      `${center[0]},${center[1]}`
    )}&apiKey=${geocoding.apiKey}&limit=${geocoding.limit}&in=countryCode:${
      geocoding.region
    }`
  }

  getLocationsFromQuery = (
    address: string
  ): Observable<IGeocodingFeature[]> => {
    if (!address || typeof address !== 'string') {
      return of(null)
    }
    const simpleUrl = this.url.replace('{query}', address)
    const cityUrl = this.url
      .replace('q={query}', 'qq={query}')
      .replace('{query}', `city=${address}`)
    const countyUrl = this.url
      .replace('q={query}', 'qq={query}')
      .replace('{query}', `county=${address}`)
    return forkJoin([
      this.http.get(simpleUrl),
      this.http.get(cityUrl),
      this.http.get(countyUrl),
    ]).pipe(
      map(
        ([simpleResults, countryResults, countyResults]: [
          IGeocodingResponse,
          IGeocodingResponse,
          IGeocodingResponse
        ]) => {
          const items = [
            ...countyResults.items,
            ...countryResults.items,
            ...simpleResults.items,
          ]
          const reducedItems = items.reduce((acc, item) => {
            return acc.some((e) => e.title === item.title)
              ? acc
              : [...acc, item]
          }, [])
          return reducedItems ? reducedItems : null
        }
      ),
      catchError((err) => {
        console.log(err)
        return of(null)
      })
    )
  }
}
