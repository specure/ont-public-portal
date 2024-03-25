import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SimpleDialogComponent } from './components/simple-dialog/simple-dialog.component'
import { TranslocoModule } from '@ngneat/transloco'
import { MatButtonModule } from '@angular/material/button'

@NgModule({
  declarations: [SimpleDialogComponent],
  imports: [CommonModule, MatButtonModule, TranslocoModule],
  exports: [SimpleDialogComponent],
})
export class DialogsModule {}
