import { Component, Input } from '@angular/core'
import { Router } from '@angular/router'
import { ERoutes } from 'src/app/core/enums/routes.enum'
import { TestService } from '../../../test/services/test.service'
import { NTCookieService } from '@nettest/cookie-widget'

@Component({
    selector: 'nt-functional-cookie',
    templateUrl: './functional-cookie.component.html',
    styleUrls: ['./functional-cookie.component.scss'],
    standalone: false
})
export class FunctionalCookieComponent {
  @Input() functionalCookiesEnabled = false
  @Input() cookieWidgetEnabled?: boolean
  @Input() language?: string
  constructor(private router: Router, private testService: TestService) {}

  enableCookie() {
    NTCookieService.I.storeOne({
      _id: undefined,
      isAccepted: true,
      key: 'functional',
      translations: [],
    })
  }

  runTest() {
    this.testService.goToTest()
  }
}
