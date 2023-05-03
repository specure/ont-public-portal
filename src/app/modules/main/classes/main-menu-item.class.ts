import { IMainMenuItem } from '../interfaces/main-menu-item.interface'

export class MainMenuItem implements IMainMenuItem {
  id: string
  parent: string
  children?: IMainMenuItem[]
  icon?: string
  label: string
  // tslint:disable-next-line:variable-name
  menu_order?: number
  route: string
  translations: {language: string}[]

  get className() {
    if (this.children && this.children.length) {
      return 'nt-menu__item--with-subs'
    }
    if (this.parent) {
      return 'nt-menu__item--sub'
    }
  }
}
