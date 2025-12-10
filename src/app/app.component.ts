/* eslint-disable @angular-eslint/prefer-standalone */
/* eslint-disable @angular-eslint/prefer-inject */
import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core'
import { IMainProject } from './modules/main/interfaces/main-project.interface'
import { Observable } from 'rxjs'
import { IAppState } from './store'
import { Store, select } from '@ngrx/store'
import { getMainState } from './store/main/main.reducer'
import { distinctUntilKeyChanged, map } from 'rxjs/operators'
import { ErrorService } from './core/services/error.service'
import { AnalyticsService } from './core/services/analytics.service'
import { PrivacyService } from './core/services/privacy.service'
import { NavigationStart, Router } from '@angular/router'
import { setNavigationEvent } from './store/common/common.action'
import { isPlatformBrowser } from '@angular/common'
import { TestService } from './modules/main/modules/test/services/test.service'
import { SeoService } from './core/services/seo.service'
import pack from '../../package.json'
import { getHistoryState } from './store/history/history.reducer'
import { TestRepoService } from './modules/main/modules/test/services/test-repo.service'

@Component({
  selector: 'nt-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit, OnDestroy {
  error$ = this.errorService?.dialogHandler()
  navigationSub = this.router.events.subscribe((e: NavigationStart) => {
    if (e instanceof NavigationStart) {
      this.store.dispatch(setNavigationEvent({ event: e }))
    }
  })
  project$: Observable<IMainProject> = this.store.pipe(
    select(getMainState),
    distinctUntilKeyChanged('project'),
    map((s) => {
      const { project } = s

      if (project && isPlatformBrowser(this.platformId)) {
        this.privacyService.initWidget(project)
        this.analyticsService.init(project)
        this.seoService.setSmartAppBanner(project)
      }
      return project
    })
  )

  constructor(
    private analyticsService: AnalyticsService,
    private errorService: ErrorService,
    private privacyService: PrivacyService,
    private router: Router,
    private seoService: SeoService,
    private store: Store<IAppState>,
    private testRepo: TestRepoService,
    private testService: TestService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    if (globalThis.history && 'scrollRestoration' in globalThis.history) {
      globalThis.history.scrollRestoration = 'manual'
    }

    globalThis['startTest'] = () => {
      this.testService.goToTest()
    }

    const gitInfo = (pack as any).gitInfo || {}
    if (gitInfo.branch && gitInfo.hash) {
      console.log(`${gitInfo.branch}-${gitInfo.hash.slice(0, 8)}`)
    }

    if (isPlatformBrowser(this.platformId)) {
      globalThis.addEventListener('beforeunload', () => {
        this.handlePageUnload()
      })
    }
  }

  ngOnInit(): void {
    this.testService.setTestServers()
  }

  ngOnDestroy(): void {
    this.navigationSub.unsubscribe()
  }

  private handlePageUnload(): void {
    const { isHistoryAllowed } = this.store.selectSignal(getHistoryState)()
    if (!isHistoryAllowed) {
      this.testRepo.clearHistory()
    }
  }
}
