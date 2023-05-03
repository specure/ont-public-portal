import { createAction, props } from '@ngrx/store'
import { IMainMenu } from 'src/app/modules/main/interfaces/main-menu.interface'
import { IMainProject } from 'src/app/modules/main/interfaces/main-project.interface'
import { IMainPage } from 'src/app/modules/main/interfaces/main-page.interface'
import { TestServer } from '../../modules/main/modules/test/classes/test-server.class'
import { IMainAsset } from 'src/app/modules/main/interfaces/main-asset.interface'
import { IFeedback } from 'src/app/modules/main/interfaces/feedback.interface'

export const loadMenus = createAction('[MAIN] Loading menus...')
export const loadMenusEnd = createAction(
  '[MAIN] Loading menus... [END]',
  props<{
    headerMenu: IMainMenu
    footerMenu: IMainMenu
    feedbackMenu?: IMainMenu
  }>()
)
export const loadPage = createAction(
  '[MAIN] Loading page...',
  props<{ route: string }>()
)
export const loadPageEnd = createAction(
  '[MAIN] Loading page... [END]',
  props<{ page: IMainPage }>()
)
export const loadProject = createAction('[MAIN] Loading project... ')
export const loadProjectEnd = createAction(
  '[MAIN] Loading project... [END]',
  props<{ project: IMainProject }>()
)
export const setLanguage = createAction(
  '[MAIN] Setting language...',
  props<{ lang: string }>()
)
export const setMeasurementServer = createAction(
  '[MAIN] Setting server...',
  props<{ server: TestServer }>()
)
export const storeAsset = createAction(
  '[MAIN] Storing asset...',
  props<{ asset: IMainAsset; key: string }>()
)
export const postFeedback = createAction(
  '[MAIN] Posting feedback...',
  props<{ feedback: IFeedback }>()
)
export const postFeedbackEnd = createAction(
  '[MAIN] Posting feedback... [END]',
  props<{ feedback: IFeedback }>()
)
