import {Injectable} from '@angular/core'
import {Observable, of} from 'rxjs'
import {getMapState} from '../../../store/map/map.reducer'
import {ENetworkOperator} from '../components/filter/map-layer-filter.component'
import {Store} from '@ngrx/store'
import {first, map, switchMap, take, tap} from 'rxjs/operators'
import {TranslocoService} from '@ngneat/transloco'
import { convertBytes } from 'src/app/core/helpers/convert-bytes'
import { ESpeedUnits } from 'src/app/core/enums/speed-units.enum'
import { convertMs } from 'src/app/core/helpers/convert-ms'
import { MapMouseEvent, Popup, Map, MapboxGeoJSONFeature, LngLat } from 'mapbox-gl'
import { environment } from 'src/environments/environment'
import { MainMapService } from './main-map.service'
import { ELayerPrefix } from '../enums/layer-prefix.enum'

const COUNTIES_LABEL = 'map.popup.county'
const MUNICIPALITIES_LABEL = 'map.popup.municipality'

@Injectable({
  providedIn: 'root'
})
export class PopupService {

  private popup: Popup

  constructor(
    private mapService: MainMapService,
    private store: Store,
    private transloco: TranslocoService
  ) { }

  addPopup(mapContainer: Map, e: MapMouseEvent & { features?: MapboxGeoJSONFeature[] }) {
    return this.getPopupContent(
      mapContainer,
      e?.features[0]
    ).pipe(
      first(),
      tap(content => {
        if (!this.popup) {
          this.popup = new Popup()
        }

        if (content) {
          this.popup.setLngLat(e?.lngLat)
            .addTo(mapContainer)
            .setHTML(`<section>${content}</section>`)
        }
      })
    )
  }

  addMunicipalityPopupToCenter(mapContainer: Map, coordinates: LngLat) {
    return this.store.select(getMapState).pipe(
      first(),
      switchMap(state => {
        const currentLayer = this.mapService.getLayer(mapContainer, state)
        const feature = this.mapService.findRenderedFeature(mapContainer, currentLayer, coordinates)
        if (!feature) {
          return of(null)
        }
        return this.getPopupContent(
          mapContainer,
          feature
        )
      }),
      tap(content => {
        if (!this.popup) {
          this.popup = new Popup()
        }

        if (content) {
          this.popup.setLngLat(coordinates)
            .addTo(mapContainer)
            .setHTML(`<section>${content}</section>`)
        }
      })
    )
  }

  editPopup(mapContainer: Map, currentLayer: string) {
    if (!this.popup || !this.popup.isOpen()) {
      return of(null)
    }

    const feature = this.mapService.findRenderedFeature(mapContainer, currentLayer, this.popup.getLngLat())

    if (!feature) {
      this.popup.remove()
      return of(null)
    }

    return this.getPopupContent(
      mapContainer,
      feature
    ).pipe(
      first(),
      tap (content => {
        if (content) {
          this.popup.setHTML(`<section>${content}</section>`)
        } else {
          this.popup.remove()
        }
      })
    )

  }

  private getPopupHeader(mapContainer: Map) {
    if (mapContainer.getZoom() > environment.map.municipalitiesMaxZoom) {
      return undefined
    }
    if (mapContainer.getZoom() >= environment.map.countiesMaxZoom) {
      return MUNICIPALITIES_LABEL
    }
    return COUNTIES_LABEL
  }

  private getPopupContent(mapContainer: Map, e: mapboxgl.MapboxGeoJSONFeature): Observable<string> {
    return this.getPopupPropertyPrefix()
      .pipe(
        take(1),
        map(prefix => {
          if (e) {
            if (!this.showZeroValues(mapContainer) && !e.properties[prefix + '-COUNT']) {
              return ''
            }

            const download = `${
              convertBytes( (e.properties[prefix + '-DOWNLOAD'] || 0) * 1000).to(ESpeedUnits.MBPS).toLocaleString()
            } Mbps`
            const upload = `${
              convertBytes( (e.properties[prefix + '-UPLOAD'] || 0) * 1000).to(ESpeedUnits.MBPS).toLocaleString()
            } Mbps`
            const ping = `${ convertMs(e.properties[prefix + '-PING'] || 0).toLocaleString() } ms`

            return [
              {label: this.getPopupHeader(mapContainer), value: e.properties.NAME || ''},
              {label: 'map.popup.count', value: e.properties[prefix + '-COUNT'] || 0},
              {label: 'map.popup.download', value: download},
              {label: 'map.popup.upload', value: upload},
              {label: 'map.popup.ping', value: ping }
            ].map((value, index) => {
              if (value.label) {
                return `
                  <div class="mapboxgl-popup-content__row ${index ? '' : 'mapboxgl-popup-content__header'}">
                    <span class="mapboxgl-popup-content__row__label">${this.transloco.translate(value.label)}</span>
                    <span class="mapboxgl-popup-content__row__value">${value.value}</span>
                  </div>
                  `
              } else {
                return ''
              }
            }).join('')
          } else {
            return ''
          }
        })
      )
  }

  private getPopupPropertyPrefix(): Observable<string> {
    return this.store.select(getMapState)
      .pipe(
        map(s => {
          const datePrefix = s.date.value
          const technology = s.technology.key.toUpperCase()
          const operator = this.mapService.getOperatorName(s)
          return [datePrefix, technology, operator].join('-')
        })
      )
  }

  private showZeroValues(mapContainer: Map) {
    const prefix = this.mapService.getLayerPrefix(mapContainer)
    return prefix === ELayerPrefix.COUNTIES || prefix === ELayerPrefix.MUNICIPALITIES
  }
}
