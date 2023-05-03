import { ITestServerResponse } from '../interfaces/test-server-response.interface'
import { ITestServer } from '../interfaces/test-server.interface'

export class TestServer implements ITestServer{
  name?: string
  sponsor: string
  country: string
  address: string
  distance: number
  port: number
  city: string
  id: number

  static fromResponse(resp: ITestServerResponse) {
    const testServer = new TestServer()
    if (resp) {
      testServer.address = resp.webAddress
      testServer.city = resp.city
      testServer.id = resp.id
      testServer.port = resp.portSsl
      testServer.name = resp.name
      testServer.distance = Math.round(resp.distance / 1000) ?? 0
    }
    return testServer
  }

  get title() {
    return this.city ? `${this.name} (${this.city})` : this.name
  }
}
