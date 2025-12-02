import { Component } from '@angular/core'
import { select, Store } from '@ngrx/store'
import { filter, pluck, map } from 'rxjs/operators'
import { IAppState } from 'src/app/store'
import { getMainState } from 'src/app/store/main/main.reducer'

@Component({
    selector: 'nt-feedback-button',
    templateUrl: './feedback-button.component.html',
    styleUrls: ['./feedback-button.component.scss'],
    standalone: false
})
export class FeedbackButtonComponent {
  feedbackLink$ = this.store.pipe(
    select(getMainState),
    pluck('feedbackMenu'),
    filter(menu => !!menu),
    map(menu => menu.menu_items?.[0])
  )

  constructor(
    private store: Store<IAppState>
  ) { }

}
