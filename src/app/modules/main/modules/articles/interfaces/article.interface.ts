import { IMainAsset } from '../../../interfaces/main-asset.interface'
import { IMainPage } from '../../../interfaces/main-page.interface'

export interface IArticle extends IMainPage {
  title: string
  slug: string
  picture?: IMainAsset
  created_by: { [key: string]: any }
}
