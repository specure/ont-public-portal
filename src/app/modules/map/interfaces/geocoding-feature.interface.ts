export interface LatLng {
  lat: number
  lng: number
  alt?: number | undefined
}

export interface IGeocodingFeature {
  title: string
  id: string
  mapView: { east: number; north: number; south: number; west: number }
  position: LatLng
  resultType: 'locality' | 'administrativeArea'
}
