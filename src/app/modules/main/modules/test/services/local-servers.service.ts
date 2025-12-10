import { Injectable } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { Store } from '@ngrx/store'
import { IAppState } from 'src/app/store'
import {
  setAbortServerSearch,
  setLocalServers,
  setSearchingLocalServers,
  setSearchProgress,
} from 'src/app/store/test/test.action'
import { TestServer } from '../classes/test-server.class'
import { TestServersDialogComponent } from '../components/test-servers-dialog/test-servers-dialog.component'

@Injectable({
  providedIn: 'root',
})
export class LocalServersService {
  private abortServerSearch = this.store.selectSignal(
    (state) => state.test.abortServerSearch
  )
  private searching = this.store.selectSignal(
    (state) => state.test.searchingLocalServers
  )

  constructor(
    private readonly dialog: MatDialog,
    private readonly store: Store<IAppState>
  ) {}

  async findLocalServer() {
    this.store.dispatch(
      setSearchingLocalServers({ searchingLocalServers: true })
    )
    const localServers: TestServer[] = []
    try {
      let isOpen = await this.checkPort(5005)
      if (isOpen) {
        localServers.push(
          new TestServer({
            id: Date.now() + 5005,
            address: '127.0.0.1',
            port: 5005,
            name: `Local, port 5005`,
            isLocal: true,
          })
        )
      } else {
        for (let i = 0; i < 65535; i++) {
          if (this.abortServerSearch()) {
            this.store.dispatch(
              setAbortServerSearch({ abortServerSearch: false })
            )
            break
          }
          isOpen = await this.checkPort(i)
          if (isOpen) {
            localServers.push(
              new TestServer({
                id: Date.now() + i,
                address: '127.0.0.1',
                port: i,
                name: `Local, port ${i}`,
                isLocal: true,
              })
            )
          }
          this.store.dispatch(
            setSearchProgress({ searchProgress: (i / 65535) * 100 })
          )
        }
      }
      this.store.dispatch(setLocalServers({ localServers }))
    } catch (err) {
      console.error('Error searching for local servers', err)
    } finally {
      this.store.dispatch(
        setSearchingLocalServers({ searchingLocalServers: false })
      )
    }
  }

  private async checkPort(portNumber: number): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = new WebSocket(`ws://127.0.0.1:${portNumber}`)
      socket.onerror = () => {
        socket.close()
        resolve(false)
      }
      socket.onmessage = (ev) => {
        console.log(`Message from port ${portNumber}: ${ev.data}`)
        socket.close()
        resolve(ev.data.includes('RMBTv'))
      }
    })
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
