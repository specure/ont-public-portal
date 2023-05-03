import { createReducer, on } from '@ngrx/store'
import { IAppState } from '..'
import { ITestVisualizationState } from 'src/app/modules/main/modules/test/interfaces/test-visualization-state.interface'
import {
  visualInit,
  visualPing,
  visualDown,
  visualInitUp,
  visualUp,
  visualEnd,
  visualError,
  visualSuccess,
  setTestInfo,
  visualReset,
  setLocation,
  visualResultEnd,
  visualInitDown,
  setShowProgress,
} from './test.action'
import { TestVisualizationStateInit } from 'src/app/modules/main/modules/test/classes/test-visualization-state-init.class'
import { TestVisualizationStatePing } from 'src/app/modules/main/modules/test/classes/test-visualization-state-ping.class'
import { TestVisualizationStateDown } from 'src/app/modules/main/modules/test/classes/test-visualization-state-down.class'
import { TestVisualizationStateInitUp } from 'src/app/modules/main/modules/test/classes/test-visualization-state-init-up.class'
import { TestVisualizationStateInitDown } from 'src/app/modules/main/modules/test/classes/test-visualization-state-init-down.class'
import { TestVisualizationStateUp } from 'src/app/modules/main/modules/test/classes/test-visualization-state-up.class'
import { TestVisualizationStateEnd } from 'src/app/modules/main/modules/test/classes/test-visualization-state-end.class'
import { ITestInfo } from 'src/app/modules/main/modules/test/interfaces/test-info.interface'
import { TestVisualizationStateFinalResult } from 'src/app/modules/main/modules/test/classes/test-visualization-state-final-result.class'
import { ITestState } from 'src/app/modules/main/modules/test/interfaces/test-state.interface'
import { ETestStages } from 'src/app/modules/main/modules/test/enums/test-stages.enum'

export class TestState implements ITestState {
  info: ITestInfo
  location: { longitude: number; latitude: number }
  visualization: ITestVisualizationState
  result
  preparing = false
  finished = false
  showProgress = false
  stage: ETestStages
}

export const testReducer = createReducer(
  new TestState(),
  on(setLocation, (state, { location }) => ({ ...state, location })),
  on(setTestInfo, (state, { info }) => ({ ...state, info })),
  on(setShowProgress, (state, { showProgress }) => ({
    ...state,
    showProgress,
  })),
  on(visualInit, (state) => ({
    ...state,
    stage: ETestStages.INIT,
    preparing: true,
    finished: false,
    showProgress: true,
    visualization: TestVisualizationStateInit.from(state.visualization),
  })),
  on(visualInitDown, (state, { down, up, progress }) => ({
    ...state,
    stage: ETestStages.INIT_DOWN,
    visualization: TestVisualizationStateInitDown.from(
      state.visualization,
      down,
      up,
      progress
    ),
  })),
  on(visualPing, (state, { ping, progress }) => ({
    ...state,
    stage: ETestStages.PING,
    preparing: false,
    visualization: TestVisualizationStatePing.from(
      state.visualization,
      ping,
      progress
    ),
  })),
  on(visualDown, (state, { ping, down, progress, time }) => ({
    ...state,
    stage: ETestStages.DOWN,
    visualization: TestVisualizationStateDown.from(
      state.visualization,
      ping,
      down,
      progress,
      time
    ),
  })),
  on(visualInitUp, (state, { down, up, progress }) => ({
    ...state,
    stage: ETestStages.INIT_UP,
    visualization: TestVisualizationStateInitUp.from(
      state.visualization,
      down,
      up,
      progress
    ),
  })),
  on(visualUp, (state, { up, progress, time }) => ({
    ...state,
    stage: ETestStages.UP,
    visualization: TestVisualizationStateUp.from(
      state.visualization,
      up,
      progress,
      time
    ),
  })),
  on(visualEnd, (state, { up, progress, time }) => ({
    ...state,
    stage: ETestStages.END,
    visualization: TestVisualizationStateEnd.from(
      state.visualization,
      up,
      progress,
      time
    ),
  })),
  on(visualError, (state, { result }) => ({
    ...state,
    result,
    stage: ETestStages.RESULT,
    preparing: false,
    finished: true,
  })),
  on(visualSuccess, (state, { result }) => ({
    ...state,
    result,
    stage: ETestStages.END,
    preparing: false,
    finished: true,
  })),
  on(visualResultEnd, (state, { data, visualization }) => ({
    ...state,
    stage: ETestStages.RESULT,
    finished: true,
    info: data
      ? {
          ...data,
          serverName: data.measurement_server_name,
          remoteIp: data.ip_address,
          providerName: data.client_provider,
        }
      : null,
    visualization,
  })),
  on(visualReset, () => new TestState())
)

export const getTestState = (state: IAppState) => state.test
