import { AfterViewInit, Component, NgZone, OnDestroy } from '@angular/core'
import * as maplibregl from 'maplibre-gl'
import { MainMapService } from 'src/app/modules/map/services/main-map.service'
import { ELayerPrefix } from 'src/app/modules/map/enums/layer-prefix.enum'
import { TestService } from '../../services/test.service'
import { TestServer } from '../../classes/test-server.class'
import { distinctUntilChanged, map, Subject, take, takeUntil, tap } from 'rxjs'
import { AsyncPipe } from '@angular/common'
import { TestServerPopupComponent } from '../test-server-popup/test-server-popup.component'
import { Store } from '@ngrx/store'
import { IAppState } from 'src/app/store'

const DEFAULT_MARKER_COLOR = '#0958bd'
const SELECTED_MARKER_COLOR = '#ff004d'
@Component({
  selector: 'nt-test-servers-map',
  imports: [AsyncPipe, TestServerPopupComponent],
  templateUrl: './test-servers-map.component.html',
  styleUrl: './test-servers-map.component.scss',
})
export class TestServersMapComponent implements AfterViewInit, OnDestroy {
  destroyed$ = new Subject<void>()
  clickedServer: TestServer
  selectedServer: TestServer
  servers$ = this.store.select((state: IAppState) => state.test.cloudServers)
  private selectedServer$ = this.store
    .select((state: IAppState) => state.test.selectedServer)
    .pipe(takeUntil(this.destroyed$), distinctUntilChanged())
    .subscribe((server) => {
      this.selectedServer = server
      this.markSelectedServer()
    })

  private map: maplibregl.Map
  private markers: maplibregl.Marker[] = []

  constructor(
    private readonly ngZone: NgZone,
    private readonly store: Store<IAppState>,
    private readonly mapper: MainMapService,
    private readonly testService: TestService
  ) {
    globalThis['closePopup'] = () => {
      this.ngZone.run(() => {
        this.markers.forEach((marker) => {
          const isOpen = marker.getPopup().isOpen()
          isOpen && marker.togglePopup()
        })
      })
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next()
    this.destroyed$.complete()
  }

  ngAfterViewInit(): void {
    this.initMap()
  }

  private initMap() {
    this.ngZone.runOutsideAngular(() => {
      this.map = this.mapper.getDefaultMap()
      this.mapper.setDefaultControls(this.map)
      this.map.on('style.load', () => {
        this.hideNonBaseLayers()
        this.addServersToMap()
      })
    })
  }

  private hideNonBaseLayers() {
    this.map.getStyle().layers.forEach((layer) => {
      const prefix = layer.id.split('-')?.[0]
      if (Object.values(ELayerPrefix).includes(prefix as ELayerPrefix)) {
        this.map.removeLayer(layer.id)
      }
    })
  }

  private addServersToMap() {
    this.servers$.pipe(takeUntil(this.destroyed$)).subscribe((servers) => {
      this.markers.forEach((marker) => marker.remove())
      this.markers = servers.map((server: TestServer) => {
        return this.mapper.addMarker(
          this.map,
          {
            lng: server.location.longitude,
            lat: server.location.latitude,
          },
          {
            color:
              server.id === this.selectedServer.id
                ? SELECTED_MARKER_COLOR
                : DEFAULT_MARKER_COLOR,
            popup: this.mapper.popupFromHtml(
              document.getElementById(`server-popup-${server.id}`)
            ),
            onClick: () => {
              this.ngZone.run(() => {
                this.clickedServer = server
                this.testService.setServer(server)
              })
            },
          }
        )
      })
    })
  }

  private markSelectedServer() {
    if (!this.markers?.length) {
      return
    }
    this.markers.forEach((marker) => {
      const markerLngLat = marker.getLngLat()
      const isSelected =
        markerLngLat.lat === this.selectedServer.location?.latitude &&
        markerLngLat.lng === this.selectedServer.location?.longitude
      const markerSvg =
        marker
          .getElement()
          .querySelector(`g[fill="${DEFAULT_MARKER_COLOR}"]`) ??
        marker.getElement().querySelector(`g[fill="${SELECTED_MARKER_COLOR}"]`)
      if (markerSvg) {
        markerSvg.setAttribute(
          'fill',
          isSelected ? SELECTED_MARKER_COLOR : DEFAULT_MARKER_COLOR
        )
      }
      if (this.selectedServer.location) {
        this.map.flyTo({
          center: [
            this.selectedServer.location.longitude,
            this.selectedServer.location.latitude,
          ],
        })
      }
      const isOpen = marker.getPopup().isOpen()
      if (isSelected) {
        isOpen ||
          this.clickedServer?.id === this.selectedServer.id ||
          marker.togglePopup()
      } else {
        isOpen && marker.togglePopup()
      }
    })
  }
}
