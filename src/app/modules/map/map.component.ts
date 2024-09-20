import { Component } from '@angular/core'
import { TranslocoService } from '@ngneat/transloco'
import { filter, first, tap } from 'rxjs/operators'
import { getMainState } from '../../store/main/main.reducer'
import { PlatformService } from 'src/app/core/services/platform.service'
import { ITimelineStep } from './interfaces/timeline-step.interface'
import { Store } from '@ngrx/store'
import { IAppState } from 'src/app/store'
import { setDate } from 'src/app/store/map/map.action'
import dayjs from 'dayjs/esm'
import { firstValueFrom } from 'rxjs'

const TIMELINE_MONTHS = 23

@Component({
  selector: 'nt-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent {
  page$ = this.store.select(getMainState).pipe(
    filter((s) => !!s.project),
    first(),
    tap((s) => {
      const { project } = s
      const now = new Date().toISOString()
      this.timelineStartDate = project.data_export_start_date
        ? dayjs(project.data_export_start_date, 'YYYY-MM').startOf('M')
        : dayjs(now).subtract(TIMELINE_MONTHS, 'months').startOf('M')
      this.populateSteps(now).then()
    })
  )
  steps: ITimelineStep[] = []
  timelineStartDate: dayjs.Dayjs

  get isDesktop() {
    return this.platform.isDesktop
  }

  constructor(
    private store: Store<IAppState>,
    private platform: PlatformService,
    private transloco: TranslocoService
  ) {}

  async populateSteps(startDate: string) {
    const defaultMonth = 0
    for (let i = TIMELINE_MONTHS; i >= 0; i--) {
      const date = dayjs(startDate).startOf('M').subtract(i, 'M')
      const month = date.format('MMMM').toLowerCase()
      const shortMonth = await firstValueFrom(
        this.transloco.selectTranslate(`map.timeline.${month}.short`)
      )
      const fullMonth = await firstValueFrom(
        this.transloco.selectTranslate(`map.timeline.${month}.full`)
      )
      const step = {
        shortMonth,
        value: date.format('YYYYMM'),
        fullMonthAndYear: `${fullMonth} ${date.format('YYYY')}`,
        year: date.month() === 0 ? `${date.year()}` : '',
        originalDate: date.toDate(),
        disabled: date.isBefore(this.timelineStartDate),
      }

      this.steps.push(step)
      if (i === defaultMonth) {
        this.store.dispatch(setDate({ date: step }))
      }
    }
  }
}
