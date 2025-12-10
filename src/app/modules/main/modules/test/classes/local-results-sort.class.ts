import { ISort } from 'src/app/core/interfaces/sort.interface'

export class LocalResultsSort implements ISort {
  active: string
  direction: 'asc' | 'desc'

  constructor(data: Partial<ISort>) {
    let active = data.active ?? 'measurementDate'
    switch (active) {
      case 'measurementDate':
        active = 'time'
        break
      case 'download':
        active = 'test_speed_download'
        break
      case 'upload':
        active = 'test_speed_upload'
        break
      case 'ping':
        active = 'test_ping_median'
        break
    }

    this.active = active
    this.direction = (data.direction ?? 'asc') as 'asc' | 'desc'
  }
}
