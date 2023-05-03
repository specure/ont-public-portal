import { Component, Input } from '@angular/core'
import { IMainProject } from 'src/app/modules/main/interfaces/main-project.interface'

@Component({
  selector: 'nt-export-warning',
  templateUrl: './export-warning.component.html',
  styleUrls: ['./export-warning.component.scss'],
})
export class ExportWarningComponent {
  @Input() project: IMainProject

  print() {
    globalThis.print?.()
  }
}
