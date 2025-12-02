import { Component, OnInit, Input } from '@angular/core'
import { ITestItemState } from '../../interfaces/test-item-state.interface'
import { ETestStatuses } from '../../enums/test-statuses.enum'
import { TranslocoService } from '@ngneat/transloco'
import { convertMs } from 'src/app/core/helpers/convert-ms'

@Component({
    selector: 'nt-test-indicator',
    templateUrl: './test-indicator.component.html',
    styleUrls: ['./test-indicator.component.scss'],
    standalone: false
})
export class TestIndicatorComponent {
  @Input() data: ITestItemState

  get counter() {
    const parsedVal = Number(this.data?.counter)
    if (!isNaN(parsedVal)) {
      return convertMs(parsedVal).toLocaleString()
    }
    return '-'
  }

  get isActive() {
    return this.data && this.data.container === ETestStatuses.ACTIVE
  }

  get isDone() {
    return this.data && this.data.container === ETestStatuses.DONE
  }

  get label() {
    return (
      this.data &&
      this.data.label &&
      this.transloco.translate(`test.${this.data.label}.label`)
    )
  }

  get units() {
    return (
      this.data &&
      this.data.label &&
      this.transloco.translate(`test.${this.data.label}.units`)
    )
  }

  constructor(private transloco: TranslocoService) {}
}
