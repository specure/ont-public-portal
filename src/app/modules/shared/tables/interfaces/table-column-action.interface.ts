import { ITableColumn } from './table-column.interface'

export interface ITableColumnAction<T> {
    color?: string
    label: string
    matIcon?: string
    perform: (value: T, column: ITableColumn<T>, ...args) => void
    getDisabled?: (value: T, column: ITableColumn<T>, ...args) => boolean
    getInProgress?: (value: T, column: ITableColumn<T>, ...args) => boolean
    getTooltip?: (value: T, column: ITableColumn<T>, ...args) => string
}
