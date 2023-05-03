import {
  Component,
  EventEmitter,
  Inject,
  Input,
  Output,
  PLATFORM_ID,
} from '@angular/core'
import { MatSelectChange } from '@angular/material/select'
import { TranslocoService } from '@ngneat/transloco'
import { openClose } from 'src/app/core/animations/open-close.animation'
import { IMainProject } from 'src/app/modules/main/interfaces/main-project.interface'
import { MainHttpService } from 'src/app/modules/main/services/main-http.service'
import { environment } from 'src/environments/environment'
import { TestServer } from '../../classes/test-server.class'
import { TestService } from '../../services/test.service'
import { isPlatformBrowser } from '@angular/common'
import { Platform } from '@angular/cdk/platform'

@Component({
  animations: [openClose],
  selector: 'nt-test-home-init',
  templateUrl: './test-home-init.component.html',
  styleUrls: ['./test-home-init.component.scss'],
})
export class TestHomeInitComponent {
  @Output() launchTest = new EventEmitter()
  @Input() selectedServer: TestServer
  @Input() servers: TestServer[]
  @Input() project: IMainProject

  testInviteImg$ = this.mainHttpService.getAssetByName(
    `test-invite-img.${environment.cms.projectSlug}.svg`
  )

  get isProd() {
    return environment.production
  }

  get isBrowser() {
    return isPlatformBrowser(this.platform)
  }

  constructor(
    private mainHttpService: MainHttpService,
    private testService: TestService,
    private transloco: TranslocoService,
    @Inject(PLATFORM_ID) private platform: Platform
  ) {}

  changeServer($event: MatSelectChange) {
    this.testService.setServer($event.value)
  }

  getMethodologyLink(path: string) {
    return `/${this.transloco.getActiveLang()}/${path}`
  }

  objectComparisonFunction(option: any, value: any): boolean {
    return option.id === value.id
  }
}
