import { IMainMenuItem } from './main-menu-item.interface'
import { ITranslatable } from 'src/app/core/interfaces/translatable.interface'

export interface IMainMenuItemTranslation {
    language: string
    menu_item: IMainMenuItem
}
