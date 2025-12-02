/* eslint-disable @angular-eslint/prefer-standalone */
/* eslint-disable @angular-eslint/prefer-inject */
import {
  Component,
  EventEmitter,
  Inject,
  input,
  OnDestroy,
  Output,
  PLATFORM_ID,
} from '@angular/core'
import { MatSelectChange } from '@angular/material/select'
import { TranslocoService } from '@ngneat/transloco'
import { openClose } from 'src/app/core/animations/open-close.animation'
import { IMainProject } from 'src/app/modules/main/interfaces/main-project.interface'
import { MainHttpService } from 'src/app/modules/main/services/main-http.service'
import { environment } from 'src/environments/environment'
import { TestService } from '../../services/test.service'
import { isPlatformBrowser } from '@angular/common'
import { Platform } from '@angular/cdk/platform'
import { distinctUntilChanged, map, Observable, Subject, takeUntil } from 'rxjs'
import { IAppState } from 'src/app/store'
import { select, Store } from '@ngrx/store'
import { getMainState } from 'src/app/store/main/main.reducer'
import { LocalServersService } from '../../services/local-servers.service'

@Component({
  animations: [openClose],
  selector: 'nt-test-home-init',
  templateUrl: './test-home-init.component.html',
  styleUrls: ['./test-home-init.component.scss'],
  standalone: false,
})
export class TestHomeInitComponent implements OnDestroy {
  project$: Observable<IMainProject> = this.store.pipe(
    select(getMainState),
    map((s) => s.project)
  )
  destroyed$ = new Subject<void>()
  servers$ = this.store.select((state: IAppState) => state.test.cloudServers)
  selectedServer$ = this.store
    .select((state: IAppState) => state.test.selectedServer)
    .pipe(takeUntil(this.destroyed$), distinctUntilChanged())

  testInviteImg$ = this.mainHttpService.getAssetByName(
    `test-invite-img.${environment.cms.projectSlug}.svg`
  )

  get isProd() {
    return environment.production
  }

  get isBrowser() {
    return isPlatformBrowser(this.platform)
  }

  constructor(
    private mainHttpService: MainHttpService,
    private store: Store<IAppState>,
    private localServersService: LocalServersService,
    private testService: TestService,
    private transloco: TranslocoService,
    @Inject(PLATFORM_ID) private platform: Platform
  ) {}

  ngOnDestroy(): void {
    this.destroyed$.next()
    this.destroyed$.complete()
  }

  changeServer($event: MatSelectChange) {
    this.testService.setServer($event.value)
  }

  getMethodologyLink(path: string) {
    return `/${this.transloco.getActiveLang()}/${path}`
  }

  launchTest() {
    this.testService.goToTest()
  }

  showServerDialog() {
    this.localServersService.openTestServersDialog()
  }
}
