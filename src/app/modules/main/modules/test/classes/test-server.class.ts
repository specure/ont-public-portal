import { ITestServerResponse } from '../interfaces/test-server-response.interface'
import { ITestServer } from '../interfaces/test-server.interface'

export class TestServer implements ITestServer {
  ipV4Support: boolean
  ipV6Support: boolean
  dedicated: boolean
  location?: { latitude: number; longitude: number }
  name?: string
  sponsor: string
  country: string
  address: string
  distance: number
  port: number
  city: string
  id: number
  isLocal?: boolean

  static fromResponse(resp: ITestServerResponse) {
    const testServer = new TestServer()
    if (resp) {
      Object.assign(testServer, resp)
      testServer.address = resp.webAddress
      testServer.port = resp.portSsl
      testServer.distance = Math.round(resp.distance / 1000) ?? 0
      if (resp.location) {
        testServer.location = {
          latitude: resp.location.latitude,
          longitude: resp.location.longitude,
        }
      }
    }
    return testServer
  }

  get title() {
    return this.city ? `${this.name} (${this.city})` : this.name
  }

  constructor(options?: Partial<ITestServer>) {
    if (options) {
      Object.assign(this, options)
    }
  }
}
