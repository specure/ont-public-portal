import { Component, Input, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { ERoutes } from 'src/app/core/enums/routes.enum'
import { TestService } from '../../../test/services/test.service'

@Component({
  selector: 'nt-functional-cookie',
  templateUrl: './functional-cookie.component.html',
  styleUrls: ['./functional-cookie.component.scss'],
})
export class FunctionalCookieComponent {
  @Input() functionalCookiesEnabled = false
  @Input() cookieWidgetEnabled?: boolean
  @Input() language?: string
  constructor(private router: Router, private testService: TestService) {}

  enableCookie() {
    window.NTCookieService?.storeOne({
      _id: undefined,
      isAccepted: true,
      key: 'functional',
      translations: [],
    })
  }

  runTest() {
    this.router.navigate([this.language, ERoutes.TEST])
    this.testService.launchTest().subscribe()
  }
}
