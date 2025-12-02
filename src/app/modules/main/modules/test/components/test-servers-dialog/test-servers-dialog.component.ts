import { Component, effect, model, OnInit, signal } from '@angular/core'
import { SharedModule } from 'src/app/modules/shared/shared.module'
import { TestServer } from '../../classes/test-server.class'
import { Store } from '@ngrx/store'
import { IAppState } from 'src/app/store'
import { TestService } from '../../services/test.service'
import { setMeasurementServer } from 'src/app/store/test/test.action'
import { FormsModule } from '@angular/forms'
import { LocalServersService } from '../../services/local-servers.service'

@Component({
  selector: 'nt-test-servers-dialog',
  imports: [SharedModule, FormsModule],
  templateUrl: './test-servers-dialog.component.html',
  styleUrl: './test-servers-dialog.component.scss',
})
export class TestServersDialogComponent implements OnInit {
  selectedServer = model<TestServer | null>(null)
  cloudServers = this.store.selectSignal((state) => state.test.cloudServers)
  localServers = this.store.selectSignal((state) => state.test.localServers)
  searching = this.store.selectSignal(
    (state) => state.test.searchingLocalServers
  )
  pristine = signal(true)
  searchProgress = this.store.selectSignal((state) => state.test.searchProgress)

  constructor(
    private readonly service: LocalServersService,
    private readonly store: Store<IAppState>
  ) {
    effect(() => {
      if (this.selectedServer()) {
        this.store.dispatch(
          setMeasurementServer({ server: this.selectedServer() })
        )
      }
      if (this.searching() || this.localServers().length > 0) {
        this.pristine.set(false)
      }
    })
  }

  ngOnInit(): void {
    this.selectedServer.set(
      this.store.selectSignal((state) => state.test.selectedServer)()
    )
  }

  search() {
    this.service.findLocalServer()
  }

  stopSearch() {
    this.service.stopSearch()
  }
}
