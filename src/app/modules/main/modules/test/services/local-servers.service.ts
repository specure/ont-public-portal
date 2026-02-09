import { Injectable } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { Store } from '@ngrx/store'
import { IAppState } from 'src/app/store'
import { setAbortServerSearch } from 'src/app/store/test/test.action'
import { TestServersDialogComponent } from '../components/test-servers-dialog/test-servers-dialog.component'

@Injectable({
  providedIn: 'root',
})
export class LocalServersService {
  private searching = this.store.selectSignal(
    (state) => state.test.searchingLocalServers
  )

  constructor(
    private readonly dialog: MatDialog,
    private readonly store: Store<IAppState>
  ) {}

  findLocalServer() {
    window.open('http://nettest.local:5006', '_blank')
  }

  openTestServersDialog() {
    this.dialog
      .open(TestServersDialogComponent, {
        width: '400px',
      })
      .afterClosed()
      .subscribe(() => {
        this.stopSearch()
      })
  }

  stopSearch() {
    if (!this.searching()) {
      return
    }
    this.store.dispatch(setAbortServerSearch({ abortServerSearch: true }))
  }
}
