import { Component, input } from '@angular/core'
import { getTestState, TestState } from 'src/app/store/test/test.reducer'
import { ETestStatuses } from '../../enums/test-statuses.enum'
import { DatePipe } from '@angular/common'
import { TranslocoService } from '@ngneat/transloco'
import { isNullOrUndefined } from 'src/app/core/helpers/util'
import { ETestStages } from '../../enums/test-stages.enum'
import { IAppState } from 'src/app/store'
import { Store } from '@ngrx/store'
import { IMainProject } from 'src/app/modules/main/interfaces/main-project.interface'

@Component({
  selector: 'nt-test-home-progress',
  templateUrl: './test-home-progress.component.html',
  styleUrl: './test-home-progress.component.scss',
  standalone: false,
})
export class TestHomeProgressComponent {
  isNullOrUndefined = isNullOrUndefined
  language = input<string>('en')
  project = input.required<IMainProject>()
  testState$ = this.store.select(getTestState)
  testStages = ETestStages

  constructor(
    private readonly datePipe: DatePipe,
    private readonly store: Store<IAppState>,
    private readonly transloco: TranslocoService
  ) {}

  getPreparedEstimation(testState: TestState) {
    return (
      testState.info &&
      testState?.visualization?.ping?.container === ETestStatuses.INIT
    )
  }

  getTitle(testState: TestState, t: (key: string) => string) {
    return `${this.getTranslation('heading')} ${
      testState?.info?.time
        ? this.datePipe.transform(
            testState.info.time,
            t('history.date_format'),
            undefined,
            this.language()
          )
        : ''
    }`
  }

  getTranslation(value: string): string {
    return this.transloco.translate(`test.result.${value}`)
  }

  getVisualizationPing(testState: TestState) {
    return testState.visualization?.ping?.container !== ETestStatuses.INIT
  }
}
