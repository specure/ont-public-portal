import {
  Component,
  OnInit,
  Input,
  NgZone,
  ChangeDetectionStrategy,
} from '@angular/core'
import { Observable } from 'rxjs'
import { ITestVisualizationState } from '../../interfaces/test-visualization-state.interface'
import { select, Store } from '@ngrx/store'
import { getTestState } from 'src/app/store/test/test.reducer'
import { withLatestFrom, map } from 'rxjs/operators'
import { TestVisualizationStateFinalResult } from '../../classes/test-visualization-state-final-result.class'
import { IAppState } from 'src/app/store'
import { TranslocoService } from '@ngneat/transloco'
import { TestVisualizationStateDown } from '../../classes/test-visualization-state-down.class'
import { TestVisualizationStateUp } from '../../classes/test-visualization-state-up.class'
import { TestVisualizationStatePing } from '../../classes/test-visualization-state-ping.class'

@Component({
    selector: 'nt-test-chart',
    templateUrl: './test-chart.component.html',
    styleUrls: ['./test-chart.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class TestChartComponent implements OnInit {
  @Input() direction: 'download' | 'upload'

  chart: any
  visualization$: Observable<ITestVisualizationState>

  get id() {
    return `${this.direction}_chart`
  }

  constructor(
    private ngZone: NgZone,
    private store: Store<IAppState>,
    private transloco: TranslocoService
  ) {}

  ngOnInit(): void {
    this.visualization$ = this.store.pipe(
      select(getTestState),
      withLatestFrom(
        this.transloco.selectTranslate('test.progress.label'),
        this.transloco.selectTranslate('test.download.units')
      ),
      map(([s, label, units]) => {
        this.handleChanges([s, label, units])
        return s.visualization
      })
    )
  }

  private handleChanges([s, label, units]) {
    const { visualization: v, preparing } = s
    this.ngZone.runOutsideAngular(async () => {
      if (
        v instanceof TestVisualizationStatePing ||
        v instanceof TestVisualizationStateFinalResult
      ) {
        await this.initChart(label, units)
      }
      if (preparing && this.chart) {
        this.chart.resetData()
      }
      if (v && this.chart) {
        if (
          v instanceof TestVisualizationStateDown &&
          this.direction === 'download'
        ) {
          this.chart.updateData(v.download)
        }

        if (
          v instanceof TestVisualizationStateUp &&
          this.direction === 'upload'
        ) {
          this.chart.updateData(v.upload)
        }

        if (v instanceof TestVisualizationStateFinalResult) {
          this.chart.setData(v[this.direction])
        }
      }
    })
  }

  private async initChart(label: string, units: string) {
    if (this.chart || !globalThis.document) {
      return
    }
    const ctx = (
      document.getElementById(this.id) as HTMLCanvasElement
    ).getContext('2d')
    const { TestChart } = await import('../../classes/test-chart.class')
    this.chart = new TestChart(ctx, label, units)
  }
}
