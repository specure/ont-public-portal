import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  NgZone,
  OnDestroy,
  Output,
  signal,
} from '@angular/core'
import { environment } from 'src/environments/environment'
import { fromEvent, lastValueFrom, Observable, Subscription, timer } from 'rxjs'
import {
  concatMap,
  debounceTime,
  distinct,
  distinctUntilKeyChanged,
  take,
  tap,
} from 'rxjs/operators'
import { MainMapService } from '../../services/main-map.service'
import { select, Store } from '@ngrx/store'
import { IAppState } from '../../../../store'
import { getMapState, MapState } from '../../../../store/map/map.reducer'
import { PopupService } from '../../services/popup.service'
import { ELayerPrefix } from '../../enums/layer-prefix.enum'
import { PlatformService } from 'src/app/core/services/platform.service'
import * as maplibregl from 'maplibre-gl'

const CONTAINER_ID = 'map'

@Component({
  selector: 'nt-mapbox',
  templateUrl: './mapbox.component.html',
  styleUrls: ['./mapbox.component.scss'],
})
export class MapboxComponent implements OnDestroy, AfterViewInit {
  @Output()
  afterMapInit = new EventEmitter<maplibregl.Map>()

  mapIsLoading = signal(true)
  screenHeight = globalThis.innerHeight
  width = globalThis.innerWidth

  private mapDataLoaded = new EventEmitter()
  private map: maplibregl.Map
  private mapLayersSub = this.store
    .pipe(
      select(getMapState),
      distinct(({ operator, date, technology }) => ({
        operator,
        date,
        technology,
      }))
    )
    .subscribe((state) => {
      this.switchLayers(state)
    })
  private mapDataSub: Subscription
  private mapStyleSub = this.store
    .select(getMapState)
    .pipe(
      distinctUntilKeyChanged('style'),
      tap((state) => {
        if (state.style?.url) {
          this.styleLoaded = false
          this.map?.setStyle(state.style.url, { diff: false })
        }
      })
    )
    .subscribe()
  private currentLayer: string
  private resizeSub = fromEvent(globalThis, 'resize')
    .pipe(
      debounceTime(150),
      tap(() => {
        this.screenHeight = globalThis.innerHeight
        this.toggleBounceScroll(true)
        timer(0).subscribe(() => {
          this.map.resize()
        })
      })
    )
    .subscribe()

  /**
   * Workaround to avoid the map being cut off on Safari for iOS
   */
  private orientationSub = fromEvent(globalThis, 'orientationchange')
    .pipe(
      debounceTime(150),
      tap(() => globalThis.scrollTo(0, 0)),
      debounceTime(150),
      tap(() => globalThis.scrollTo(0, 1))
    )
    .subscribe()

  get topPadding() {
    return this.platfrom.isMobile && this.platfrom.isLandscape ? 40 : 0
  }

  private styleLoaded = false

  constructor(
    private cdr: ChangeDetectorRef,
    private mapper: MainMapService,
    private ngZone: NgZone,
    private platfrom: PlatformService,
    private popupper: PopupService,
    private store: Store<IAppState>
  ) {
    this.mapDataSub = this.mapDataLoaded
      .pipe(
        debounceTime(500), // event fired for each tile update so we need to wait for some time between updates
        concatMap(() => this.popupper.editPopup(this.map, this.currentLayer)),
        tap(() => {
          this.mapIsLoading.set(false)
        })
      )
      .subscribe()
    this.toggleBounceScroll(true)
  }

  ngOnDestroy() {
    this.orientationSub.unsubscribe()
    this.resizeSub.unsubscribe()
    this.mapLayersSub.unsubscribe()
    this.mapDataSub.unsubscribe()
    this.mapStyleSub.unsubscribe()
    this.toggleBounceScroll(false)
  }

  ngAfterViewInit() {
    this.initMap()
    this.afterMapInit.emit(this.map)
    this.cdr.detectChanges()
  }

  private toggleBounceScroll(shouldDisable: boolean) {
    const selectors = ['body', 'html']
    if (shouldDisable) {
      selectors.forEach((selector) => {
        const el: HTMLElement = document.querySelector(selector)
        el.style.overflowY = 'hidden'
        el.style.position = 'fixed'
        el.style.height = `${globalThis.innerHeight}px`
        el.style.width = '100vw'
      })
    } else {
      selectors.forEach((selector) => {
        const el: HTMLElement = document.querySelector(selector)
        el.removeAttribute('style')
      })
    }
  }

  private initControls() {
    this.map
      .addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        'bottom-right'
      )
      .addControl(new maplibregl.GeolocateControl({}), 'bottom-right')
    navigator.geolocation.getCurrentPosition(
      () => {},
      () => {
        timer(0).subscribe(() => {
          const label = 'Location not available'
          document
            .querySelector('.maplibregl-ctrl-geolocate')
            ?.setAttribute('disabled', 'true')
          document
            .querySelector('.maplibregl-ctrl-geolocate')
            ?.setAttribute('label', label)
          document
            .querySelector('.maplibregl-ctrl-geolocate')
            ?.setAttribute('title', label)
        })
      }
    )
  }

  private initMap() {
    this.ngZone.runOutsideAngular(() => {
      const { center, zoom } = environment.map
      this.map = new maplibregl.Map({
        container: CONTAINER_ID,
        maxZoom: 15,
        minZoom: 1,
        style: this.mapper.style.url,
        zoom,
        center: center as [number, number],
      })
      this.initControls()
    })
    this.map.on('style.load', () => {
      lastValueFrom(this.getMapState()).then((state) => {
        this.styleLoaded = true
        this.switchLayers(state)
      })
    })
    this.map.on('data', () => {
      this.mapDataLoaded.emit()
    })
    this.map.on('zoom', () => {
      lastValueFrom(this.getMapState()).then((state) =>
        this.switchLayers(state)
      )
    })
  }

  private getMapState(): Observable<MapState> {
    return this.store.select(getMapState).pipe(take(1))
  }

  private layerExists(layer: string) {
    return !!this.map.getLayer(layer)
  }

  private switchLayers(state: MapState) {
    if (
      state.operator &&
      state.technology &&
      state.date?.value &&
      this.styleLoaded
    ) {
      this.currentLayer = this.mapper.getLayer(this.map, state)
      this.map.getStyle().layers.forEach((layer) => {
        const prefix = layer.id.split('-')?.[0]
        if (
          Object.values(ELayerPrefix).includes(prefix as ELayerPrefix) &&
          !layer.id.includes('Borders') &&
          layer.id !== this.currentLayer
        ) {
          this.map.setLayoutProperty(layer.id, 'visibility', 'none')
        }
      })

      if (!this.layerExists(this.currentLayer)) {
        return
      }
      this.map.setLayoutProperty(this.currentLayer, 'visibility', 'visible')

      this.map.on('click', this.currentLayer, (e) => {
        this.popupper.addPopup(this.map, e).subscribe()
      })
    }
  }
}
