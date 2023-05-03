import { Component, Input } from '@angular/core'
import { select, Store } from '@ngrx/store'
import { pluck, tap } from 'rxjs/operators'
import { IAppState } from 'src/app/store'
import { setDate } from 'src/app/store/map/map.action'
import { getMapState } from 'src/app/store/map/map.reducer'
import { ITimelineStep } from '../../interfaces/timeline-step.interface'
import { Observable } from 'rxjs'

@Component({
  selector: 'nt-mobile-timeline',
  templateUrl: './mobile-timeline.component.html',
  styleUrls: ['./mobile-timeline.component.scss']
})
export class MobileTimelineComponent {
  @Input() steps: ITimelineStep[]

  date$: Observable<ITimelineStep> = this.store.pipe(
    select(getMapState),
    pluck('date'),
    tap(() => this.sortedSteps = [...this.steps].sort(
      (a, b) => b.originalDate.getTime() - a.originalDate.getTime()
    ))
  )
  sortedSteps: ITimelineStep[] = []

  constructor(
    private store: Store<IAppState>
  ) { }

  setDate(date: ITimelineStep) {
    this.store.dispatch(setDate({ date }))
  }

}
