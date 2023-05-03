import { ETestStages } from '../enums/test-stages.enum'
import { ITestInfo } from './test-info.interface'
import { ITestVisualizationState } from './test-visualization-state.interface'

export interface ITestState {
    info?: ITestInfo
    location?
    visualization: ITestVisualizationState
    result?
    preparing: boolean
    finished: boolean
    stage: ETestStages
}
