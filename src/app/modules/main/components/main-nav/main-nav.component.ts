import { Component, EventEmitter, Input, Output } from '@angular/core'
import { IMainMenuItem } from '../../interfaces/main-menu-item.interface'

@Component({
  selector: 'nt-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss'],
})
export class MainNavComponent {
  @Input() className: string
  @Input() menu: IMainMenuItem[]

  @Output() menuClick: EventEmitter<string> = new EventEmitter()

  constructor() {}

  hasChildren(item: IMainMenuItem) {
    return item.children && item.children.length
  }

  isRouterLinkActive(item: IMainMenuItem) {
    return globalThis.location?.pathname.includes(item.route)
  }

  useMenuItemId(_: any, item: IMainMenuItem) {
    return item.id
  }
}
