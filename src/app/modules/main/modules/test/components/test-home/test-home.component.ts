import { ERoutes } from '../../../../../../core/enums/routes.enum'
import { ActivatedRoute, Router } from '@angular/router'
import { Component, OnDestroy } from '@angular/core'
import { from, of, Observable } from 'rxjs'
import { Store, select } from '@ngrx/store'
import { IAppState } from 'src/app/store'
import { getMainState } from 'src/app/store/main/main.reducer'
import { concatMap, map } from 'rxjs/operators'
import { getTestState, TestState } from 'src/app/store/test/test.reducer'
import { ETestStatuses } from '../../enums/test-statuses.enum'
import { isNullOrUndefined } from 'src/app/core/helpers/util'
import { TranslocoService } from '@ngneat/transloco'
import { setShowProgress } from 'src/app/store/test/test.action'
import { DatePipe } from '@angular/common'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'
import { MatSelectChange } from '@angular/material/select'
import { IMainProject } from '../../../../interfaces/main-project.interface'
import { DialogService } from 'src/app/core/services/dialog.service'
import { PlatformService } from 'src/app/core/services/platform.service'
import { TestService } from '../../services/test.service'
import { openClose } from 'src/app/core/animations/open-close.animation'
import { TestServer } from '../../classes/test-server.class'
import { TranslatePipe } from 'src/app/modules/shared/partials/pipes/translate.pipe'
import {
  parseFigures,
  parseUnderlinedText,
} from 'src/app/core/helpers/parse-custom-tags'
import { marked } from 'marked'
import { ETestStages } from '../../enums/test-stages.enum'
import { environment } from 'src/environments/environment'

@Component({
  animations: [openClose],
  selector: 'nt-test-home',
  templateUrl: './test-home.component.html',
  styleUrls: ['./test-home.component.scss'],
})
export class TestHomeComponent implements OnDestroy {
  isNullOrUndefined = isNullOrUndefined
  isBetaBlockVisible = false
  isContactsBlockVisible = false
  isStoreLinksVisible = false
  language = ''

  servers$ = this.testService.getTestServers().pipe(
    map(([selectedServer, servers]) => {
      this.selectedServer = selectedServer as TestServer
      return servers
    })
  )

  selectedServer: TestServer
  testStarter = 'onclick="window.startTest();return false;"'

  page$: Observable<string> = this.store.pipe(
    select(getMainState),
    map((s) => {
      if (!s.page) {
        return ''
      }
      const translatedPage = parseUnderlinedText(
        this.translate.transform(s.page, 'content')
      )
      if (!translatedPage) {
        return ''
      }
      return parseFigures(marked.parse(translatedPage) as string)
    })
  )
  project$: Observable<IMainProject> = this.store.pipe(
    select(getMainState),
    map((s) => {
      this.isBetaBlockVisible = s.project?.slug === 'no'
      this.isContactsBlockVisible = s.project?.slug === 'no'
      this.isStoreLinksVisible = s.project?.slug !== 'nt'
      this.language = s.lang === 'sr_ME-Latn' ? 'sr-Latn' : s.lang
      this.shareButtons = [
        {
          className: 'twitter',
          url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            globalThis.document?.title
          )}&url=${encodeURIComponent(globalThis?.location?.href)}`,
        },
        {
          className: 'facebook',
          url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            globalThis.location?.href
          )}`,
        },
        {
          className: 'linkedin',
          url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            globalThis.location?.href
          )}`,
        },
        {
          className: 'whatsapp',
          url: this.sanitizer.bypassSecurityTrustUrl(
            `whatsapp://send?text=${encodeURIComponent(
              globalThis.document?.title
            )}%20${encodeURIComponent(globalThis?.location?.href)}`
          ),
        },
      ]
      if (s.server) {
        this.selectedServer = s.server
      }
      return s.project
    })
  )
  routes = ERoutes
  shareButtons: { className: string; url: string | SafeUrl }[] = []
  testSate$ = this.store.select(getTestState)
  testStages = ETestStages

  get appStoreImg() {
    if (this.language === 'nb') {
      return `${environment.cms.routes.images}/${this.language}/app-store-badge.png`
    }
    return `${environment.cms.routes.images}/en/app-store-badge.png`
  }

  get googlePlayImg() {
    if (this.language === 'nb') {
      return `${environment.cms.routes.images}/${this.language}/google-play-badge.png`
    }
    return `${environment.cms.routes.images}/en/google-play-badge.png`
  }

  get isMobile() {
    return this.platform.isMobile
  }

  get chartWidth(): number {
    const chartWidthList = [
      {
        check: this.platform.isMobile || this.platform.isTab,
        width: globalThis.innerWidth - 55,
      },
      {
        check: this.platform.isDesktop,
        width: Math.round(
          (globalThis.document?.querySelector('nt-test-home')?.clientWidth ??
            0) /
            2 -
            29
        ),
      },
    ]

    return chartWidthList?.find(({ check }) => check)?.width ?? 0
  }

  constructor(
    private datePipe: DatePipe,
    private platform: PlatformService,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private store: Store<IAppState>,
    private testService: TestService,
    private translate: TranslatePipe,
    private transloco: TranslocoService,
    private dialog: DialogService
  ) {}

  ngOnDestroy(): void {
    this.testService.stopTest()
    if (this.route.snapshot.params['id']) {
      this.store.dispatch(setShowProgress({ showProgress: false }))
    }
  }

  openDialog() {
    const answersTitles = this.transloco
      .translate(`beta.explanation_answer_titles`)
      .split('#')
    const answersArticles = this.transloco
      .translate(`beta.explanation_answer_articles`)
      .split('#')
    const articles = answersTitles.map((title, index) => ({
      title,
      message: answersArticles[index] ?? '',
    }))
    const message = {
      complexMessage: true,
      articles,
      closeButton: this.transloco.translate(`beta.explanation_close`),
    }
    this.dialog.openDialog(message)
  }

  getPreparedEstimation(testState: TestState) {
    return (
      testState.info &&
      testState?.visualization?.ping?.container === ETestStatuses.INIT
    )
  }

  getTitle(testState: TestState, t: (key: string) => string) {
    return `${this.getTranslation('heading')} ${
      testState?.info?.time
        ? this.datePipe.transform(
            testState.info.time,
            t('history.date_format'),
            undefined,
            this.language
          )
        : ''
    }`
  }

  getTranslation(value: string): string {
    return this.transloco.translate(`test.result.${value}`)
  }

  getVisualizationPing(testState: TestState) {
    return testState.visualization?.ping?.container !== ETestStatuses.INIT
  }

  launchTest() {
    const observable =
      globalThis.location?.pathname !== `/${this.language}/${ERoutes.TEST}`
        ? from(this.router.navigate([this.language, ERoutes.TEST]))
        : of(null)
    observable.pipe(concatMap(() => this.testService.launchTest())).subscribe()
    globalThis.scrollTo(0, 0)
  }

  changeServer($event: MatSelectChange) {
    this.testService.setServer($event.value)
  }

  objectComparisonFunction(option: any, value: any): boolean {
    return option.id === value.id
  }

  print() {
    globalThis.print?.()
  }
}
