import { ActionCreator, Store } from '@ngrx/store'
import { Injectable } from '@angular/core'
import { MatSort } from '@angular/material/sort'
import { PageEvent } from '@angular/material/paginator'
import { TypedAction } from '@ngrx/store/src/models'

import { ERoutes } from '../enums/routes.enum'
import { IAppState } from 'src/app/store'
import { IBasicRequest } from '../interfaces/basic-request.interface'
import { Paginator } from '../classes/paginator.class'
import { Sort, DEFAULT_ACTIVE, DEFAULT_DIRECTION } from '../classes/sort.class'
import { URLService } from './url.service'

@Injectable({ providedIn: 'root' })
export class TableSortService {
  constructor(private url: URLService, private store: Store<IAppState>) {}

  changeSort(
    newSort: MatSort,
    action: ActionCreator<
      string,
      (props: { request: IBasicRequest }) => IBasicRequest & TypedAction<string>
    >
  ) {
    const { active, direction } = newSort
    const paginator = Paginator.fromSearchParams(
      globalThis.location?.pathname as ERoutes
    )
    const sort = new Sort(active, direction)
    this.store.dispatch(action({ request: { paginator, sort } }))
    this.url.toSearchParams({ ...paginator, ...sort })
  }

  changePage(
    page: PageEvent,
    action: ActionCreator<
      string,
      (props: { request: IBasicRequest }) => IBasicRequest & TypedAction<string>
    >
  ) {
    const { pageSize, pageIndex } = page
    const paginator = new Paginator(pageIndex, pageSize)
    const sort = Sort.fromSearchParams(
      DEFAULT_ACTIVE,
      DEFAULT_DIRECTION,
      globalThis.location?.pathname as ERoutes
    )
    this.store.dispatch(action({ request: { paginator, sort } }))
    this.url.toSearchParams({ ...paginator, ...sort })
  }
}
