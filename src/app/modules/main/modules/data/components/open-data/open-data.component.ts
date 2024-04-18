import { Component, OnInit } from '@angular/core'
import { select, Store } from '@ngrx/store'
import { map } from 'rxjs/operators'
import { TranslatePipe } from 'src/app/modules/shared/partials/pipes/translate.pipe'
import { IAppState } from 'src/app/store'
import { getMainState } from 'src/app/store/main/main.reducer'
import dayjs from 'dayjs/esm'
import {
  enqueExport,
  initExportQueue,
} from 'src/app/modules/shared/export/store/export.action'
import { MarkdownService } from 'ngx-markdown'

@Component({
  selector: 'nt-open-data',
  templateUrl: './open-data.component.html',
  styleUrls: ['./open-data.component.scss'],
})
export class OpenDataComponent implements OnInit {
  exportType = 'monthly'
  months = []
  month = this.months[this.months.length - 1]
  startMonth = 5
  startYear = 2017
  content: string
  title$ = this.store.pipe(
    select(getMainState),
    map((s) => {
      const dateArr = s.project?.data_export_start_date?.split('-')
      if (dateArr?.length > 1) {
        this.startMonth = parseInt(dateArr[1], 10)
        this.startYear = parseInt(dateArr[0], 10)
      }
      this.fillSelectWithYears()
      this.content = this.markdown.parse(
        this.translate.transform(s.page, 'content')
      ) as string
      return this.translate.transform(s.page, 'name')
    })
  )

  constructor(
    private markdown: MarkdownService,
    private store: Store<IAppState>,
    private translate: TranslatePipe
  ) {}

  ngOnInit(): void {
    this.store.dispatch(initExportQueue())
  }

  fillSelectWithYears() {
    const currentYear = Number(dayjs().year())
    const yearsCount = currentYear - this.startYear + 1

    let years = []
    years.length = yearsCount
    years.fill(currentYear)
    years = years.map((_, i) => {
      return i ? years[i - 1] - i : years[i]
    })
    const months = []

    years.forEach((val) => {
      for (let index = 12; index > 0; index--) {
        if (val === this.startYear && index < this.startMonth) {
          return
        }
        months.push(`${val}-${index < 10 ? `0${index}` : index}`)
      }
    })
    this.months = months.slice(12 - Number(dayjs().format('MM')))
    this.month = this.months[0]
  }

  load() {
    this.store.dispatch(
      enqueExport({ date: this.exportType === 'monthly' ? this.month : null })
    )
  }
}
