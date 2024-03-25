import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ExportSnackbarComponent } from './components/export-snackbar/export-snackbar.component'
import { TranslocoModule } from '@ngneat/transloco'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

@NgModule({
  declarations: [ExportSnackbarComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslocoModule,
  ],
  exports: [ExportSnackbarComponent],
})
export class ExportModule {}
