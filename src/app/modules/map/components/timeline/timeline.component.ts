import { Component, Input } from '@angular/core'
import { select, Store } from '@ngrx/store'
import { setDate } from '../../../../store/map/map.action'
import { ITimelineStep } from '../../interfaces/timeline-step.interface'
import { IAppState } from 'src/app/store'
import { getMapState } from 'src/app/store/map/map.reducer'
import { pluck } from 'rxjs/operators'
import { Observable } from 'rxjs'

@Component({
  selector: 'nt-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent {
  @Input() steps: ITimelineStep[]

  date$: Observable<ITimelineStep> = this.store.pipe(
    select(getMapState),
    pluck('date')
  )
  draggedItem: ITimelineStep
  highlighted: ITimelineStep
  selectionEnabled = false

  constructor(private store: Store<IAppState>) {
  }

  dragItem(step: ITimelineStep) {
    this.setSelectionEnabled(true)
    this.draggedItem = step
  }

  hideTooltip() {
    this.highlighted = null
  }

  hover(event: MouseEvent, step: ITimelineStep) {
    this.highlighted = step
    if (event.buttons > 0 && this.selectionEnabled) {
      this.dragItem(step)
    } else {
      this.draggedItem = null
    }
  }

  isPopupHidden(step: ITimelineStep) {
    return this.draggedItem !== step || !this.selectionEnabled
  }

  isStepSelected(step: ITimelineStep, selected: ITimelineStep ) {
    return ((step === selected && !this.draggedItem) || step === this.draggedItem)
  }

  isTooltipHidden(step: ITimelineStep) {
    return this.highlighted !== step || this.draggedItem === step || !this.selectionEnabled
  }

  selectItem(date: ITimelineStep) {
    if (date.disabled) {
      return
    }
    if (this.selectionEnabled) {
      this.store.dispatch(setDate({ date }))
    }
    this.setSelectionEnabled(true)
  }

  setFocusOnTimeline(flag: boolean, event: MouseEvent) {
    if (flag) {
      this.setSelectionEnabled(event.buttons === 0)
    } else {
      this.setSelectionEnabled(false)
      this.hideTooltip()
    }
  }

  setSelectionEnabled(flag: boolean) {
    this.selectionEnabled = flag
    if (!this.selectionEnabled) {
      this.draggedItem = null
    }
  }

  trackByFn(index: number, item: ITimelineStep) {
    return item.value
  }
}
