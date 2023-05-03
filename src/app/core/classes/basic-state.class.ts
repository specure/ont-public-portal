import { IPaginator } from '../interfaces/paginator.interface'
import { ISort } from '../interfaces/sort.interface'

export class BasicState<C, O> {
  current: C
  options: O
  paginator: IPaginator
  sort: ISort
}
