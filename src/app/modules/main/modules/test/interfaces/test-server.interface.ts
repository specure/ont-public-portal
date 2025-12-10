export interface ITestServer {
  name?: string
  sponsor: string
  country: string
  address: string
  distance: number
  port: number
  city: string
  id: number
  location?: {
    latitude: number
    longitude: number
  }
  ipV4Support: boolean
  ipV6Support: boolean
  dedicated: boolean
  isLocal?: boolean
}
