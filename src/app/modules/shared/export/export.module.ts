import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ExportSnackbarComponent } from './components/export-snackbar/export-snackbar.component'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner'
import { TranslocoModule } from '@ngneat/transloco'

@NgModule({
  declarations: [
    ExportSnackbarComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslocoModule
  ],
  exports: [
    ExportSnackbarComponent
  ]
})
export class ExportModule { }
