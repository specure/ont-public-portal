import { IMainMenuItem } from './main-menu-item.interface'
import { EMenuPlacements } from '../enums/menu-placements.enum'
import { EMenuFlavors } from '../enums/menu-flavors.enum'

export interface IMainMenu {
  id: string
  menu_items: IMainMenuItem[]
  placement: EMenuPlacements
  flavor: EMenuFlavors
  custom_structure?: string

  toTree?(activeLang: string): IMainMenu
}
