import { Component, signal } from '@angular/core'
import { TestServer } from '../../classes/test-server.class'
import { Store } from '@ngrx/store'
import { IAppState } from 'src/app/store'
import { setLocalServers } from 'src/app/store/test/test.action'
import { TestService } from '../../services/test.service'
import { LocalServersService } from '../../services/local-servers.service'

@Component({
  selector: 'nt-test-local-servers',
  templateUrl: './test-local-servers.component.html',
  styleUrl: './test-local-servers.component.scss',
  standalone: false,
})
export class TestLocalServersComponent {
  searching$ = this.store.select((state) => state.test.searchingLocalServers)

  search() {
    this.service.openTestServersDialog()
    this.service.findLocalServer()
  }

  constructor(
    private readonly service: LocalServersService,
    private readonly store: Store<IAppState>
  ) {}
}
