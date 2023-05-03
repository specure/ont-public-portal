import { ITestVisualizationState } from '../interfaces/test-visualization-state.interface'
import { extend } from 'src/app/core/helpers/extend'
import { TestVisualizationState } from './test-visualization-state.class'
import { ETestStatuses } from '../enums/test-statuses.enum'
import { ETestLabels } from '../enums/test-labels.enum'

export class TestVisualizationStateInitUp extends TestVisualizationState {
  static from(other: ITestVisualizationState, down: string | number, up: string | number, progress: number) {
    const testState = extend<ITestVisualizationState>(
      new TestVisualizationStateInitUp(),
      other
    )

    testState.download = {
      chart: testState?.download?.chart || [],
      container: ETestStatuses.DONE,
      counter: down,
      label: ETestLabels.DOWNLOAD,
      progress: 100,
      time: null,
    }

    testState.upload = {
      chart: testState?.upload?.chart || [],
      container: ETestStatuses.ACTIVE,
      counter: up,
      label: ETestLabels.UPLOAD,
      progress: testState?.upload?.progress || 0,
      time: null,
    }

    testState.uploadInit = {progress}

    return testState
  }
}
