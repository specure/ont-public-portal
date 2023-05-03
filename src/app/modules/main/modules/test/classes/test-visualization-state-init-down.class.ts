import { ITestVisualizationState } from '../interfaces/test-visualization-state.interface'
import { extend } from 'src/app/core/helpers/extend'
import { TestVisualizationState } from './test-visualization-state.class'

export class TestVisualizationStateInitDown extends TestVisualizationState {
  static from(other: ITestVisualizationState, down: string | number, up: string | number, progress: number) {
    const testState = extend<ITestVisualizationState>(
      new TestVisualizationStateInitDown(),
      other
    )

    testState.downloadInit = { progress }

    return testState
  }
}
