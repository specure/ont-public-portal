import { Component, input } from '@angular/core'
import { IMainProject } from 'src/app/modules/main/interfaces/main-project.interface'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'nt-test-home-store-links',
  templateUrl: './test-home-store-links.component.html',
  styleUrl: './test-home-store-links.component.scss',
  standalone: false,
})
export class TestHomeStoreLinksComponent {
  language = input<string>('en')
  project = input.required<IMainProject>()

  get appStoreImg() {
    if (this.language() === 'nb') {
      return `${
        environment.cms.routes.images
      }/${this.language()}/app-store-badge.png`
    }
    return `${environment.cms.routes.images}/en/app-store-badge.png`
  }

  get googlePlayImg() {
    if (this.language() === 'nb') {
      return `${
        environment.cms.routes.images
      }/${this.language()}/google-play-badge.png`
    }
    return `${environment.cms.routes.images}/en/google-play-badge.png`
  }
}
