import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core'
import { select, Store } from '@ngrx/store'
import { BehaviorSubject, fromEvent } from 'rxjs'
import { debounceTime, map, tap } from 'rxjs/operators'
import { IAppState } from 'src/app/store'
import { getTestState, TestState } from 'src/app/store/test/test.reducer'
import { PlatformService } from '../../../../../../core/services/platform.service'
import { ETestStages } from '../../enums/test-stages.enum'
import { ETestStatuses } from '../../enums/test-statuses.enum'

interface ITestStage {
  title: string
  stage: ETestStages
  progress: (state: TestState) => number
}

@Component({
  selector: 'nt-test-header',
  templateUrl: './test-header.component.html',
  styleUrls: ['./test-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestHeaderComponent implements OnDestroy {
  currentStage?: ETestStages

  progress$ = this.store.pipe(
    select(getTestState),
    tap((s) => {
      const stages = this.stages.map((stage) => stage.stage)
      if (stages.includes(s.stage)) {
        this.currentStage = s.stage
      }
    })
  )

  stages: ITestStage[] = []

  desktopStages: ITestStage[] = [
    {
      title: 'test.header_initialising',
      stage: ETestStages.INIT,
      progress: (s) => (s.finished ? 0 : s.preparing && !s.info ? 15 : 100),
    },
    {
      title: 'test.header_down_pre_test',
      stage: ETestStages.INIT_DOWN,
      progress: (s) =>
        s.finished ? 0 : s.visualization?.downloadInit?.progress,
    },
    {
      title: 'test.header_latency',
      stage: ETestStages.PING,
      progress: (s) => (s.finished ? 0 : s.visualization?.ping.progress),
    },
    {
      title: 'test.header_download',
      stage: ETestStages.DOWN,
      progress: (s) => (s.finished ? 0 : s.visualization?.download?.progress),
    },
    {
      title: 'test.header_up_pre_test',
      stage: ETestStages.INIT_UP,
      progress: (s) => (s.finished ? 0 : s.visualization?.uploadInit?.progress),
    },
    {
      title: 'test.header_upload',
      stage: ETestStages.UP,
      progress: (s) => (s.finished ? 0 : s.visualization?.upload?.progress),
    },
    {
      title: 'test.header_finalisation',
      stage: ETestStages.END,
      progress: (s) => {
        if (
          s.visualization &&
          Object.values(s.visualization).every(
            (i) => i.container === ETestStatuses.DONE
          )
        ) {
          return 15
        } else {
          return 0
        }
      },
    },
  ]

  private mobileStages = [
    ...this.desktopStages,
    {
      title: 'test.header_result',
      stage: ETestStages.RESULT,
      progress: () => 0,
    },
  ]

  private resizeSub = fromEvent(globalThis, 'resize')
    .pipe(
      debounceTime(150),
      tap(() => this.setStages())
    )
    .subscribe()

  get isMobile() {
    return this.platform.isMobile
  }

  get totalStages() {
    return this.isMobile ? this.stages.length - 1 : this.stages.length
  }

  constructor(
    private platform: PlatformService,
    private store: Store<IAppState>
  ) {
    this.setStages()
  }

  ngOnDestroy(): void {
    this.resizeSub.unsubscribe()
  }

  isStageVisible(stage: ITestStage): boolean {
    return !this.isMobile || stage.stage === this.currentStage
  }

  setStages() {
    if (this.isMobile) {
      this.stages = this.mobileStages
    } else {
      this.stages = this.desktopStages
    }
  }

  shouldShowPhaseCounter(index: number) {
    return this.isMobile && index <= this.totalStages
  }

  stageTitle(_: any, stage: ITestStage) {
    return stage.title
  }
}
