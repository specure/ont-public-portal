import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { DialogsModule } from './dialogs/dialogs.module'
import { MaterialModule } from './material/material.module'
import { PartialsModule } from './partials/partials.module'
import { TablesModule } from './tables/tables.module'
import { TranslocoModule } from '@ngneat/transloco'
import { ArticleModule } from './article/article.module'
import { ExportModule } from './export/export.module'

@NgModule({
  imports: [
    ArticleModule,
    CommonModule,
    DialogsModule,
    ExportModule,
    MaterialModule,
    PartialsModule,
    TablesModule,
    TranslocoModule,
  ],
  exports: [
    ArticleModule,
    DialogsModule,
    ExportModule,
    MaterialModule,
    PartialsModule,
    TablesModule,
    TranslocoModule,
  ],
})
export class SharedModule {}
