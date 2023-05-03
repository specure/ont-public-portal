import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SimpleDialogComponent } from './components/simple-dialog/simple-dialog.component'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { TranslocoModule } from '@ngneat/transloco'



@NgModule({
    declarations: [SimpleDialogComponent],
    imports: [
        CommonModule,
        MatButtonModule,
        TranslocoModule,
    ],
    exports: [
        SimpleDialogComponent,
        MatButtonModule,
    ]
})
export class DialogsModule { }
