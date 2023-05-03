import { ERoutes } from '../enums/routes.enum'
import { ISort } from '../interfaces/sort.interface'
import { ITableColumn } from 'src/app/modules/shared/tables/interfaces/table-column.interface'

export const DEFAULT_ACTIVE = 'date'
export const DEFAULT_DIRECTION = 'desc'

export class Sort implements ISort {
  active: string
  direction: string

  static fromSearchParams(
    defaultActive = DEFAULT_ACTIVE,
    defaultDirection = DEFAULT_DIRECTION,
    route: ERoutes
  ) {
    const props = new Sort()
    const parsed = new URLSearchParams(
      (globalThis.location?.pathname === route ||
        globalThis.location?.pathname.includes(route)) &&
        globalThis.location?.search
    )
    props.active = parsed.get('active') || defaultActive
    props.direction = parsed.get('direction') || defaultDirection
    return props
  }

  static validate(
    sort: Sort,
    columns: ITableColumn[],
    defaultActive = DEFAULT_ACTIVE,
    defaultDirection = DEFAULT_DIRECTION
  ) {
    let { active, direction } = sort || {
      active: defaultActive,
      direction: defaultDirection,
    }
    if (
      !columns.some(
        (col) =>
          col.isSortable && (col.key === active || col.columnDef === active)
      )
    ) {
      active = defaultActive
      direction = defaultDirection
    }
    const timestampSort = active === 'date' || active === 'time'
    active = timestampSort ? 'measurementDate' : active

    const dateColsWithAnotherKey = [...columns]
      .filter((col) => col.columnDef === 'date' || 'time')
      .find((col) => col.key)

    if (timestampSort && dateColsWithAnotherKey) {
      active = dateColsWithAnotherKey.key
    }
    return { active, direction }
  }

  constructor(active = DEFAULT_ACTIVE, direction = DEFAULT_DIRECTION) {
    this.active = active
    this.direction = direction
  }
}
