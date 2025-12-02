import { Component, Input, Output, EventEmitter } from '@angular/core'
import { IMainMenuItem } from '../../interfaces/main-menu-item.interface'
import { ERoutes } from 'src/app/core/enums/routes.enum'

@Component({
    selector: 'nt-main-menu-item',
    templateUrl: './main-menu-item.component.html',
    styleUrls: ['./main-menu-item.component.scss'],
    standalone: false
})
export class MainMenuItemComponent {
  @Input() item: IMainMenuItem

  @Output() menuClick: EventEmitter<string> = new EventEmitter()

  isRouterLinkActive(item: IMainMenuItem) {
    return (
      item.route.includes(ERoutes.TEST_HISTORY) &&
      globalThis.location?.pathname.includes(ERoutes.TEST_HISTORY)
    )
  }
}
