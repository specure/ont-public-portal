import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  Inject,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core'
import { map, startWith } from 'rxjs/operators'
import { MatSidenav } from '@angular/material/sidenav'
import { fromEvent, of } from 'rxjs'
import { isPlatformBrowser } from '@angular/common'
import { PlatformService } from 'src/app/core/services/platform.service'
import { select, Store } from '@ngrx/store'
import { IAppState } from 'src/app/store'
import { getCommonState } from 'src/app/store/common/common.reducer'
import { environment } from 'src/environments/environment'

@Component({
    selector: 'nt-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss'],
    standalone: false
})
export class MainComponent implements AfterViewChecked {
  @ViewChild(MatSidenav, { static: false }) sidenav?: MatSidenav

  loading$ = of(false)
  isMobile$ = of(false)
  progressIndicatorColor =
    environment.cms.projectSlug === 'no' ? 'accent' : 'primary'

  constructor(
    private cdr: ChangeDetectorRef,
    private platform: PlatformService,
    private store: Store<IAppState>,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.loading$ = this.store.pipe(
        select(getCommonState),
        map((s) => s.loading)
      )
      this.isMobile$ = fromEvent(globalThis, 'resize').pipe(
        map(() => this.platform.isMobile || this.platform.isTab),
        startWith(this.platform.isMobile || this.platform.isTab)
      )
    }
  }

  ngAfterViewChecked(): void {
    this.cdr.detectChanges()
  }
}
