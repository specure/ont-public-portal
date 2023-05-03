import { createReducer, on } from '@ngrx/store'
import { IAppState } from '..'
import { IMainMenu } from 'src/app/modules/main/interfaces/main-menu.interface'
import {
  loadMenusEnd,
  loadProjectEnd,
  loadPageEnd,
  setLanguage,
  setMeasurementServer,
  storeAsset,
  postFeedbackEnd,
  loadPage,
} from './main.action'
import { IMainProject } from 'src/app/modules/main/interfaces/main-project.interface'
import { IMainPage } from 'src/app/modules/main/interfaces/main-page.interface'
import { ILocale } from 'src/app/core/interfaces/locale.interface'
import { TestServer } from '../../modules/main/modules/test/classes/test-server.class'
import { IMainAsset } from 'src/app/modules/main/interfaces/main-asset.interface'
import { IFeedback } from 'src/app/modules/main/interfaces/feedback.interface'
import { DefaultFeedback } from 'src/app/modules/main/classes/feedback.class'

export class MainState {
  headerMenu: IMainMenu
  feedbackMenu: IMainMenu
  footerMenu: IMainMenu
  lang: string
  languages: ILocale[]
  page: IMainPage
  project: IMainProject
  server: TestServer
  assets: { [key: string]: IMainAsset } = {}
  feedback: IFeedback = DefaultFeedback.instance
}

export const mainReducer = createReducer(
  new MainState(),
  on(loadMenusEnd, (state, menus) => ({ ...state, ...menus })),
  on(loadProjectEnd, (state, { project }) => ({ ...state, project })),
  on(loadPage, (state) => ({ ...state, page: null })),
  on(loadPageEnd, (state, { page }) => ({ ...state, page })),
  on(setLanguage, (state, { lang }) => ({ ...state, lang })),
  on(setMeasurementServer, (state, { server }) => ({ ...state, server })),
  on(storeAsset, (state, { key, asset }) => ({
    ...state,
    assets: { ...state.assets, [key]: asset },
  })),
  on(postFeedbackEnd, (state, { feedback }) => ({ ...state, feedback }))
)

export const getMainState = (state: IAppState) => state.main
