import { ITranslatable } from 'src/app/core/interfaces/translatable.interface'
import { IMainMenuItem } from './main-menu-item.interface'

export interface IMainPage extends ITranslatable {
  content: string
  description?: string
  id: string
  keywords?: string
  menu_item: IMainMenuItem
  name: string
  enable_table_of_contents?: boolean
}
