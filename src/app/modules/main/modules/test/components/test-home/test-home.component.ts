import { ActivatedRoute } from '@angular/router'
import { Component, OnDestroy, ViewChild } from '@angular/core'
import { Observable, Subject } from 'rxjs'
import { Store, select } from '@ngrx/store'
import { IAppState } from 'src/app/store'
import { getMainState, MainState } from 'src/app/store/main/main.reducer'
import { map } from 'rxjs/operators'
import { getTestState } from 'src/app/store/test/test.reducer'
import { isNullOrUndefined } from 'src/app/core/helpers/util'
import { setShowProgress } from 'src/app/store/test/test.action'
import { IMainProject } from '../../../../interfaces/main-project.interface'
import { TestService } from '../../services/test.service'
import { openClose } from 'src/app/core/animations/open-close.animation'
import { TranslatePipe } from 'src/app/modules/shared/partials/pipes/translate.pipe'
import {
  parseFigures,
  parseUnderlinedText,
} from 'src/app/core/helpers/parse-custom-tags'
import { marked } from 'marked'
import { TestHomeProgressComponent } from '../test-home-progress/test-home-progress.component'

@Component({
  animations: [openClose],
  selector: 'nt-test-home',
  templateUrl: './test-home.component.html',
  styleUrls: ['./test-home.component.scss'],
  standalone: false,
})
export class TestHomeComponent implements OnDestroy {
  @ViewChild(TestHomeProgressComponent)
  progressComponent: TestHomeProgressComponent
  destroyed$ = new Subject<void>()
  isNullOrUndefined = isNullOrUndefined
  isBetaBlockVisible = false
  isContactsBlockVisible = false
  isStoreLinksVisible = false
  isLocalServersVisible = false
  language = ''
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
      this.setUpProject(s)
      return s.project
    })
  )
  testSate$ = this.store.select(getTestState)

  constructor(
    private route: ActivatedRoute,
    private store: Store<IAppState>,
    private testService: TestService,
    private translate: TranslatePipe
  ) {}

  ngOnDestroy(): void {
    this.testService.stopTest()
    if (this.route.snapshot.params['id']) {
      this.store.dispatch(setShowProgress({ showProgress: false }))
    }
    this.destroyed$.next()
    this.destroyed$.complete()
  }

  private setUpProject(s: MainState) {
    this.isBetaBlockVisible = s.project?.slug === 'no'
    this.isContactsBlockVisible = s.project?.slug === 'no'
    this.isStoreLinksVisible = s.project?.slug !== 'nt'
    this.isLocalServersVisible = s.project?.enable_local_servers
    this.language = s.lang === 'sr_ME-Latn' ? 'sr-Latn' : s.lang
  }
}
