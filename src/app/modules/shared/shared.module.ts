import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { ArticleModule } from './article/article.module'
import { DialogsModule } from './dialogs/dialogs.module'
import { ExportModule } from './export/export.module'
import { MatButtonModule } from '@angular/material/button'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatDialogModule } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatMenuModule } from '@angular/material/menu'
import { MatNativeDateModule } from '@angular/material/core'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatRadioModule } from '@angular/material/radio'
import { MatSelectModule } from '@angular/material/select'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { PartialsModule } from './partials/partials.module'
import { TablesModule } from './tables/tables.module'
import { TranslocoModule } from '@ngneat/transloco'
import { MatTooltipModule } from '@angular/material/tooltip'

@NgModule({
  imports: [
    ArticleModule,
    CommonModule,
    DialogsModule,
    ExportModule,
    PartialsModule,
    TablesModule,
    TranslocoModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  exports: [
    ArticleModule,
    DialogsModule,
    ExportModule,
    PartialsModule,
    TablesModule,
    TranslocoModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
})
export class SharedModule {}
