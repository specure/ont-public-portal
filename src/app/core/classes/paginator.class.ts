import { ERoutes } from '../enums/routes.enum'
import { isNullOrUndefined } from '../helpers/util'
import { IPaginator } from '../interfaces/paginator.interface'

export const DEFAULT_PAGE = 0
export const AVAILABLE_SIZES = [5, 10, 20, 50]
export const DEFAULT_SIZE = AVAILABLE_SIZES[1]

export interface IPaginatorOptions extends IPaginator {
  availableSizes?: number[]
}

export class Paginator implements IPaginator {
  page: number
  size: number

  static fromSearchParams(route: ERoutes, defaultOptions?: IPaginatorOptions) {
    const props = new Paginator()
    const parsed = new URLSearchParams(
      (globalThis.location?.pathname === route ||
        globalThis.location?.pathname.includes(route)) &&
        globalThis.location?.search
    )
    props.page = Number(
      parsed.get('page') ?? defaultOptions?.page ?? DEFAULT_PAGE
    )
    props.size = Number(
      parsed.get('size') ?? defaultOptions?.size ?? DEFAULT_SIZE
    )
    return props
  }

  static validate(paginator: Paginator, defaultOptions?: IPaginatorOptions) {
    let page: number
    let size: number
    const isPageExists = paginator && !isNullOrUndefined(paginator.page)
    const isSizeExists = paginator && paginator.size

    if (isPageExists && paginator.page >= 0 && !isNaN(+paginator.page)) {
      page = paginator.page
    } else {
      page = DEFAULT_PAGE
    }
    if (
      isSizeExists &&
      (defaultOptions?.availableSizes ?? AVAILABLE_SIZES).indexOf(
        isSizeExists
      ) !== -1
    ) {
      size = paginator.size
    } else {
      size = defaultOptions?.size ?? DEFAULT_SIZE
    }

    return new Paginator(page, size)
  }

  constructor(page = DEFAULT_PAGE, size = DEFAULT_SIZE) {
    this.page = page
    this.size = size
  }
}
