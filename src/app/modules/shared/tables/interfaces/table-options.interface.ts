import { ITableColumn } from './table-column.interface'
import { ISort } from '../../../../core/interfaces/sort.interface'

export interface ITableOptions<T>{
    className: string
    cols: ITableColumn<T>[]
    plurals: {[key: string]: string}
    sort: ISort
    title: string
}
