import { HttpParams } from '@angular/common/http'

import { IPaginator } from 'src/app/core/interfaces/paginator.interface'
import { ISort } from 'src/app/core/interfaces/sort.interface'

export class BasicHttpParams extends HttpParams {
  constructor(paginator: IPaginator, sort: ISort, params: { [k: string]: string } = {}) {
    super({
      fromObject: {
        page: (paginator.page + 1).toString(),
        size: paginator.size.toString(),
        sort: `${sort.active},${sort.direction}`,
        ...params
      }
    })
  }
}
