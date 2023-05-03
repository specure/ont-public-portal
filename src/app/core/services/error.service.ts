import { Injectable } from '@angular/core'
import { select, Store } from '@ngrx/store'
import { getCommonState } from '../../store/common/common.reducer'
import { loadingError } from '../../store/common/common.action'
import { IAppState } from '../../store'
import { filter, map } from 'rxjs/operators'
import { DialogService } from './dialog.service'
import { ESystemMessages } from '../enums/system-messages.enum'

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor(
    private dialog: DialogService,
    private store: Store<IAppState>,
  ) { }

  dialogHandler() {
    return this.store.pipe(
      select(getCommonState),
      filter(s => !!s.error),
      map(s => {
        const { error } = s
        this.dialog.openDialog(
          error?.error?.message
          || (typeof error?.error === 'string' && error?.error)
          || ESystemMessages.NETWORK_ERROR
        )
        this.store.dispatch(loadingError({ error: null }))
        return s.error
      })
    )
  }
}
