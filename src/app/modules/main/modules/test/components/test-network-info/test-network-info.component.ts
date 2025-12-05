/* eslint-disable @angular-eslint/prefer-inject */
import { Component, input, OnInit } from '@angular/core'
import { IMainProject } from 'src/app/modules/main/interfaces/main-project.interface'
import { SharedModule } from 'src/app/modules/shared/shared.module'
import { TestState } from 'src/app/store/test/test.reducer'
import { MatSelectChange } from '@angular/material/select'
import { TestService } from '../../services/test.service'
import { distinctUntilChanged, map, Observable } from 'rxjs'
import { select, Store } from '@ngrx/store'
import { IAppState } from 'src/app/store'
import { getMainState } from 'src/app/store/main/main.reducer'
import { AsyncPipe } from '@angular/common'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'

@Component({
  selector: 'nt-test-network-info',
  imports: [AsyncPipe, SharedModule],
  templateUrl: './test-network-info.component.html',
  styleUrl: './test-network-info.component.scss',
})
export class TestNetworkInfoComponent implements OnInit {
  testState = input.required<TestState>()
  project$: Observable<IMainProject> = this.store.pipe(
    select(getMainState),
    map((s) => {
      this.setShareButtons()
      return s.project
    })
  )
  servers$ = this.store
    .select((state: IAppState) => state.test.cloudServers)
    .pipe()
  selectedServer$ = this.store
    .select((state: IAppState) => state.test.selectedServer)
    .pipe(distinctUntilChanged())
  shareButtons: { className: string; url: string | SafeUrl }[] = []

  constructor(
    private readonly sanitizer: DomSanitizer,
    private readonly store: Store<IAppState>,
    private readonly testService: TestService
  ) {}

  ngOnInit(): void {
    if (this.testState().info?.measurement_server_name) {
      const existingServer = this.testState().cloudServers?.find(
        (server) =>
          server.name === this.testState().info?.measurement_server_name
      )
      if (existingServer) {
        this.testService.setServer(existingServer)
      }
    }
  }

  changeServer($event: MatSelectChange) {
    this.testService.setServer($event.value)
  }

  launchTest() {
    this.testService.goToTest()
  }

  print() {
    globalThis.print?.()
  }

  setShareButtons() {
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
  }
}
