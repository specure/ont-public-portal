import { Component, input } from '@angular/core'
import { IMainProject } from 'src/app/modules/main/interfaces/main-project.interface'

@Component({
  selector: 'nt-test-home-beta-info',
  templateUrl: './test-home-beta-info.component.html',
  styleUrl: './test-home-beta-info.component.scss',
  standalone: false,
})
export class TestHomeBetaInfoComponent {
  project = input.required<IMainProject>()
}
