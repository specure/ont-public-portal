import { IPaginator } from './paginator.interface'
import { ISort } from './sort.interface'

export interface IBasicRequest {
  paginator: IPaginator
  sort: ISort
}
