import { Component, ViewChild } from '@angular/core'
import { MatSidenav } from '@angular/material/sidenav'

import { PlatformService } from 'src/app/core/services/platform.service'

@Component({
    selector: 'nt-side-navigation',
    templateUrl: './side-navigation.component.html',
    styleUrls: ['side-navigation.component.scss'],
    standalone: false
})
export class SideNavigationComponent {
  @ViewChild(MatSidenav, { static: false }) sidenav: MatSidenav

  get position() {
    return this.platform.isMobile ? 'end' : 'start'
  }

  constructor(
    private platform: PlatformService
  ) {}

  open() {
    this.sidenav.open()
  }
}
