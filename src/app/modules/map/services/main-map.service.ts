import { Injectable } from '@angular/core'
import { IMainMapStyle } from '../interfaces/main-map-style.interface'
import { MapState } from '../../../store/map/map.reducer'
import { ENetworkOperator } from '../components/filter/map-layer-filter.component'
import { LngLat, Map, Marker } from 'maplibre-gl'
import { environment } from 'src/environments/environment'
import { ELayerPrefix } from '../enums/layer-prefix.enum'
import { IGeocodingFeature } from '../interfaces/geocoding-feature.interface'

@Injectable({
  providedIn: 'root',
})
export class MainMapService {
  marker: Marker

  get style(): IMainMapStyle {
    return {
      name: 'map.style.street',
      url: environment.map.styleUrl,
    }
  }

  get ispStyle(): IMainMapStyle {
    return {
      name: 'map.style.street',
      url: environment.map.ispStyleUrl,
    }
  }

  constructor() {}

  findRenderedFeature(
    mapContainer: Map,
    currentLayer: string,
    coordinates: LngLat
  ) {
    return mapContainer
      .queryRenderedFeatures(mapContainer.project(coordinates))
      .find((f) => f.layer.id === currentLayer)
  }

  flyTo(mapContainer: Map, evt: IGeocodingFeature, zoom?: number) {
    const { lng, lat } = evt.position
    if (!zoom && evt.mapView) {
      const { mapView: ex } = evt
      mapContainer.fitBounds([ex.west, ex.south, ex.east, ex.north])
    } else {
      mapContainer.flyTo({
        center: { lat, lng },
        zoom: zoom || mapContainer.getZoom(),
      })
    }
    this.marker?.remove()
    this.marker = new Marker({
      color: '#4668F2',
    })
      .setLngLat({ lng, lat })
      .addTo(mapContainer)
  }

  getLayer(mapContainer: Map, state: MapState) {
    return `${this.getLayerPrefix(mapContainer)}-${state.date?.value}-${
      state.technology?.key
    }-${this.getOperatorName(state)}`
  }

  getLayerPrefix(mapContainer: Map) {
    const { map: m } = environment
    const zoom = mapContainer.getZoom()

    switch (true) {
      case zoom >= m.hexagons01kmMaxZoom:
        return ELayerPrefix.HEXAGONS_001_KM
      case zoom >= m.hexagons1kmMaxZoom:
        return ELayerPrefix.HEXAGONS_01_KM
      case zoom >= m.hexagons10kmMaxZoom:
        return ELayerPrefix.HEXAGONS_1_KM
      case zoom >= m.municipalitiesMaxZoom:
        return ELayerPrefix.HEXAGONS_10_KM
      case zoom >= m.countiesMaxZoom:
        return ELayerPrefix.MUNICIPALITIES
      default:
        return ELayerPrefix.COUNTIES
    }
  }

  getOperatorName(state: MapState) {
    let operator = Object.keys(ENetworkOperator).find(
      (e) => ENetworkOperator[e] === state?.operator
    )
    if (!operator) {
      operator = state?.operator
    }
    return operator?.replace(/\s/g, '-')?.toUpperCase() || ''
  }
}
