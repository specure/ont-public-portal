import {
  Component,
  EventEmitter,
  HostListener,
  OnDestroy,
  Output,
} from '@angular/core'
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  first,
  map,
  pluck,
  switchMap,
  tap,
} from 'rxjs/operators'
import { LngLat } from 'maplibre-gl'
import { ERoutes } from '../../../../core/enums/routes.enum'
import { environment } from '../../../../../environments/environment'
import { Store } from '@ngrx/store'
import { IAppState } from 'src/app/store'
import { getMapState } from 'src/app/store/map/map.reducer'
import { MainMapService } from '../../services/main-map.service'
import { BehaviorSubject, forkJoin, of } from 'rxjs'
import { GeocodingService } from '../../services/geocoding.service'
import { setMunicipality } from 'src/app/store/map/map.action'
import { PopupService } from '../../services/popup.service'
import { IGeocodingFeature } from '../../interfaces/geocoding-feature.interface'
import { ConfigService } from 'src/app/core/services/config.service'
import { TranslocoService } from '@ngneat/transloco'

@Component({
    selector: 'nt-menu-bar',
    templateUrl: './menu-bar.component.html',
    styleUrls: ['./menu-bar.component.scss'],
    standalone: false
})
export class MenuBarComponent implements OnDestroy {
  @Output() openMenu = new EventEmitter()
  activeCandidate = 0
  geocodeResponse: IGeocodingFeature[]
  geocodeRequest: string
  geocodeRequestChanged: BehaviorSubject<string> = new BehaviorSubject(null)
  isMenuOpen = false
  logoLink = `/${this.transloco.getActiveLang()}/${ERoutes.TEST}`
  logoPath$ = forkJoin([this.config.logoMap$, this.config.logoHeader$]).pipe(
    map(([logoMap, logoHeader]) => logoMap || logoHeader)
  )
  map: maplibregl.Map
  text: string
  routes = ERoutes

  private municipality$ = this.store.select(getMapState).pipe(
    pluck('municipality'),
    first(),
    filter((munc) => !!munc)
  )
  private sub = this.geocodeRequestChanged
    .pipe(
      tap((evt) => {
        this.geocodeRequest = evt
      }),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(this.geocoder.getLocationsFromQuery),
      tap((res) => (this.geocodeResponse = res))
    )
    .subscribe()

  constructor(
    private config: ConfigService,
    private geocoder: GeocodingService,
    private mapper: MainMapService,
    private popupper: PopupService,
    private store: Store<IAppState>,
    private transloco: TranslocoService
  ) {}

  ngOnDestroy(): void {
    this.sub?.unsubscribe()
  }

  flyTo(evt: IGeocodingFeature, zoom?: number) {
    this.mapper.flyTo(this.map, evt, zoom)
    this.geocodeRequest = evt.title
    this.resetGeocoder()
  }

  flyToActiveCandidate() {
    const location = this.geocodeResponse?.[this.activeCandidate]
    if (location) {
      this.flyTo(location)
    }
  }

  setMap(mapContainer: maplibregl.Map) {
    this.map = mapContainer
    this.setMunicipality()
  }

  setMunicipality() {
    let muncName: string
    let countyName: string
    this.municipality$
      .pipe(
        filter((munc) => !!munc),
        first(),
        /**
         * First try to find matches for municipality + county
         */
        switchMap((munc) => {
          muncName = munc
          countyName = munc.split(', ')[1]
          return this.geocoder.getLocationsFromQuery(munc)
        }),
        /**
         * If no matches for muncicipality + county try county only
         */
        switchMap((res) => {
          const munc = res?.find((r) => r.title.includes(muncName))
          return munc
            ? of([munc])
            : this.geocoder.getLocationsFromQuery(countyName)
        }),
        tap((res) => {
          if (!res?.length) {
            return
          }
          const location = res.filter(
            (r) =>
              r.resultType === 'locality' ||
              r.resultType === 'administrativeArea'
          )[0]
          const onMapLoaded = () => {
            if (location.resultType === 'locality') {
              const { lng, lat } = location.position
              this.popupper
                .addMunicipalityPopupToCenter(this.map, new LngLat(lng, lat))
                .subscribe()
            }
            this.store.dispatch(setMunicipality({ municipality: null }))
            this.map.off('load', onMapLoaded)
          }
          this.map.on('load', onMapLoaded)
          this.flyTo(
            location,
            Math.floor(
              location.resultType === 'locality'
                ? environment.map.countiesMaxZoom + 1
                : environment.map.zoom
            )
          )
        }),
        catchError(() => of(null))
      )
      .subscribe()
  }

  @HostListener('keyup.esc')
  @HostListener('document:mousedown', ['$event'])
  private resetGeocoder(evt?: MouseEvent) {
    const el = evt?.target as HTMLElement
    if (el?.className === 'mapboxgl-ctrl-geocoder--suggestion-title') {
      this.flyToActiveCandidate()
    }
    if (
      el?.className !== 'mapboxgl-ctrl-geocoder--suggestion-title' &&
      el?.className !== 'mapboxgl-ctrl-geocoder--suggestion-address' &&
      el?.className !== 'mapboxgl-ctrl-geocoder--suggestion'
    ) {
      this.geocodeResponse = null
      this.activeCandidate = 0
    }
  }

  @HostListener('keyup.arrowdown')
  private selectCandidateDown() {
    if (this.geocodeResponse?.length) {
      this.activeCandidate++
      if (this.activeCandidate > this.geocodeResponse?.length - 1) {
        this.activeCandidate = 0
      }
    }
  }

  @HostListener('keyup.arrowup')
  private selectCandidateUp() {
    if (this.geocodeResponse?.length) {
      this.activeCandidate--
      if (this.activeCandidate < 0) {
        this.activeCandidate = this.geocodeResponse?.length - 1
      }
    }
  }
}
