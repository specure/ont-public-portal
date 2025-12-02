import { Component, input } from '@angular/core'
import { IMainProject } from 'src/app/modules/main/interfaces/main-project.interface'

@Component({
  selector: 'nt-test-home-contacts',
  templateUrl: './test-home-contacts.component.html',
  styleUrl: './test-home-contacts.component.scss',
  standalone: false,
})
export class TestHomeContactsComponent {
  project = input.required<IMainProject>()
}
