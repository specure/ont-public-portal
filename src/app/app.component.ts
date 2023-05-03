import { Component, Inject, OnDestroy, PLATFORM_ID } from '@angular/core'
import { IMainProject } from './modules/main/interfaces/main-project.interface'
import { from, Observable } from 'rxjs'
import { IAppState } from './store'
import { Store, select } from '@ngrx/store'
import { getMainState } from './store/main/main.reducer'
import { concatMap, distinctUntilKeyChanged, map, tap } from 'rxjs/operators'
import { ErrorService } from './core/services/error.service'
import { AnalyticsService } from './core/services/analytics.service'
import { PrivacyService } from './core/services/privacy.service'
import { NavigationStart, Router } from '@angular/router'
import { setNavigationEvent } from './store/common/common.action'
import { clearPreviousExportQueue } from './modules/shared/export/store/export.action'
import { isPlatformBrowser } from '@angular/common'
import { ERoutes } from './core/enums/routes.enum'
import { TestService } from './modules/main/modules/test/services/test.service'
import { TranslocoService } from '@ngneat/transloco'
import { SeoService } from './core/services/seo.service'

@Component({
  selector: 'nt-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
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
    private testService: TestService,
    private transloco: TranslocoService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    if (globalThis.history && 'scrollRestoration' in globalThis.history) {
      globalThis.history.scrollRestoration = 'manual'
    }
    this.store.dispatch(clearPreviousExportQueue())

    globalThis['startTest'] = () => {
      from(this.router.navigate([this.transloco.getActiveLang(), ERoutes.TEST]))
        .pipe(
          concatMap(() => this.testService.launchTest()),
          tap(() => globalThis.scrollTo(0, 0))
        )
        .subscribe()
    }
  }

  ngOnDestroy(): void {
    this.navigationSub.unsubscribe()
  }
}
