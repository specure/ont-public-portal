import { IMainMenu } from '../interfaces/main-menu.interface'
import { IMainMenuItem } from '../interfaces/main-menu-item.interface'
import { IMainProject } from '../interfaces/main-project.interface'
import { EMenuPlacements } from '../enums/menu-placements.enum'
import { MainMenuItem } from './main-menu-item.class'
import { extend } from 'src/app/core/helpers/extend'
import { EMenuFlavors } from '../enums/menu-flavors.enum'

export class MainMenu implements IMainMenu {
  id: string
  // tslint:disable-next-line:variable-name
  menu_items: IMainMenuItem[]
  placement: EMenuPlacements
  project: IMainProject
  flavor: EMenuFlavors

  static findByPlacement(
    menus: IMainMenu[],
    placement: EMenuPlacements
  ): IMainMenu {
    if (!menus || !menus.length) {
      return new MainMenu()
    }
    return menus.reduce(
      (acc, m) => (m.placement === placement ? extend(acc, m) : acc),
      new MainMenu()
    )
  }

  toTree(activeLang: string) {
    if (!this.menu_items || !this.menu_items.length) {
      return this
    }
    const children = this.menu_items.filter((m) => !!m.parent)
    const nonChildren = this.menu_items.filter((m) => !m.parent)
    const withChildren = nonChildren
      .map((parent) =>
        extend<IMainMenuItem>(new MainMenuItem(), parent, {
          children:
            children && children.length
              ? children
                  .reduce(this.addParentToChildRoute(parent, activeLang), [])
                  .sort(this.sortByCreatedAt)
                  .sort(this.sortByMenuOrder)
              : [],
          route: `/${activeLang}/${parent.route}`,
        })
      )
      .sort(this.sortByCreatedAt)
      .sort(this.sortByMenuOrder)
    return extend(new MainMenu(), this, {
      menu_items: withChildren,
    }) as MainMenu
  }

  private addParentToChildRoute =
    (parent: IMainMenuItem, activeLang: string) => (acc, child) =>
      child.parent === parent.id
        ? [
            ...acc,
            extend(new MainMenuItem(), child, {
              route: `/${activeLang}/${parent.route}/${child.route}`,
            }),
          ]
        : acc

  private sortByCreatedAt = (a: IMainMenuItem, b: IMainMenuItem) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()

  private sortByMenuOrder = (a: IMainMenuItem, b: IMainMenuItem) =>
    a.menu_order - b.menu_order
}
