import { Component, OnDestroy } from '@angular/core'
import {
  FormControl,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
} from '@angular/forms'
import { TranslocoService } from '@ngneat/transloco'
import { Store } from '@ngrx/store'
import { BehaviorSubject, Subscription } from 'rxjs'
import { filter, map, tap, withLatestFrom } from 'rxjs/operators'
import { Sort } from 'src/app/core/classes/sort.class'
import { ESpeedUnits } from 'src/app/core/enums/speed-units.enum'
import { convertBytes } from 'src/app/core/helpers/convert-bytes'
import { convertMs } from 'src/app/core/helpers/convert-ms'
import { getDefaultLang } from 'src/app/core/helpers/transloco'
import { isNullOrUndefined } from 'src/app/core/helpers/util'
import { IMainProject } from 'src/app/modules/main/interfaces/main-project.interface'
import { TranslatePipe } from 'src/app/modules/shared/partials/pipes/translate.pipe'
import { ITableColumn } from 'src/app/modules/shared/tables/interfaces/table-column.interface'
import { IAppState } from 'src/app/store'
import { getMainState } from 'src/app/store/main/main.reducer'
import { loadNationalTable } from 'src/app/store/statistics/statistics.action'
import { getStatisticsState } from 'src/app/store/statistics/statistics.reducer'
import { ICounty } from '../../interfaces/county.interface'
import { IMunicipality } from '../../interfaces/municipality.interface'
import { IProviderStats } from '../../interfaces/provider-stats.interface'
import { StatisticsService } from '../../services/statistics.service'
import { environment } from 'src/environments/environment'
import { toSignal } from '@angular/core/rxjs-interop'

export const NATIONAL_TABLE_COLS: ITableColumn<IProviderStats>[] = [
  {
    columnDef: 'mobileCounter',
    header: 'statistics.table.title',
  },
  {
    columnDef: 'providerName',
    header: 'statistics.table.operators',
    getTooltip: (value) => value.providerName,
  },
  {
    columnDef: 'download',
    header: 'statistics.table.download',
    justify: 'flex-end',
    transformValue: (value) =>
      convertBytes(+value.download).to(ESpeedUnits.MBPS),
  },
  {
    columnDef: 'upload',
    header: 'statistics.table.upload',
    justify: 'flex-end',
    transformValue: (value) => convertBytes(+value.upload).to(ESpeedUnits.MBPS),
  },
  {
    columnDef: 'latency',
    header: 'statistics.table.latency',
    justify: 'flex-end',
    transformValue: (value) => convertMs(+value.latency),
  },
  {
    columnDef: 'measurements',
    header: 'statistics.table.measurements',
    justify: 'flex-end',
  },
]

export type FilteredMunicipality = {
  county: ICounty
  municipalities: IMunicipality[]
}

@Component({
  selector: 'nt-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
  standalone: false,
})
export class StatisticsComponent implements OnDestroy {
  action = loadNationalTable
  columns: ITableColumn<IProviderStats>[] = []
  filteredMunicipalities$ = new BehaviorSubject<FilteredMunicipality[] | null>(
    [],
  )
  form: UntypedFormGroup
  municipalities: IMunicipality[] | null | undefined = []
  nationalTable$ = this.store.select(getStatisticsState).pipe(
    filter((s) => !!s.nationalTable || !!s.municipalities),
    withLatestFrom(this.store.select(getMainState)),
    map(([s, { project }]) => {
      const { municipalities, nationalTable } = s
      this.columns = NATIONAL_TABLE_COLS
      this.subHeaderColumns = NATIONAL_TABLE_COLS.map((col) =>
        this.statistics.buildSubHeader(col, nationalTable),
      )
      this.setMunicipalities(municipalities)
      this.municipalities = municipalities
      this.project = project
      return nationalTable && nationalTable.allMeasurements > 0
        ? nationalTable
        : null
    }),
  )
  isNullOrUndefined = isNullOrUndefined
  project: IMainProject | null | undefined
  providerTypes = [
    {
      value: 'mno',
      label: 'statistics.table.mno',
    },
    {
      value: 'isp',
      label: 'statistics.table.isp',
    },
  ]
  providerTypesSub: Subscription
  sort = new Sort('providerName', 'asc')
  subHeaderColumns: ITableColumn<IProviderStats>[] = []
  techOptions = [
    { label: 'statistics.filter.all', value: 'all' },
    { value: '5G' },
    { value: '4G' },
    { value: '3G' },
    { value: '2G' },
  ]
  filtersV2Enabled = toSignal(
    this.store
      .select(getMainState)
      .pipe(map(({ project }) => project?.enable_filters_v2)),
  )

  constructor(
    private fb: UntypedFormBuilder,
    private statistics: StatisticsService,
    private store: Store<IAppState>,
    private translate: TranslatePipe,
    private transloco: TranslocoService,
  ) {
    this.form = this.fb.group({
      tech: new UntypedFormControl(this.techOptions[0].value),
      providerType: new FormControl(this.providerTypes[0].value),
    })
    this.providerTypesSub = this.form.controls.providerType.valueChanges
      .pipe(
        tap((providerType) => {
          this.toggleTechSelect(providerType)
          this.setOperatorColumnName(providerType)
          this.loadNationalTable({ tech: this.form.controls.tech.value })
        }),
      )
      .subscribe()
  }

  ngOnDestroy(): void {
    this.providerTypesSub?.unsubscribe()
  }

  getTechLabel(
    tech: { label?: string; value: string },
    t: (key: string) => string,
  ) {
    if (this.form.controls.providerType.value === this.providerTypes[1].value) {
      return 'WLAN'
    }
    return tech.label ? t(tech.label) : tech.value
  }

  searchMunicipality(evt: InputEvent) {
    const name = (evt?.target as HTMLInputElement)?.value?.toLowerCase()
    if (!name) {
      return this.setMunicipalities(this.municipalities)
    }
    this.setMunicipalities(
      this.municipalities?.filter((m) => {
        const { county } = m
        return (
          m.name?.toLowerCase().includes(name) ||
          this.translate.transform(m, 'name')?.toLowerCase().includes(name) ||
          (county &&
            (county.name?.toLowerCase().includes(name) ||
              this.translate
                .transform(county, 'name')
                ?.toLowerCase()
                .includes(name)))
        )
      }),
    )
  }

  loadNationalTable(filters?: { tech: string; platforms?: string[] }) {
    let { tech, platforms } = filters || {}
    if (!this.filtersV2Enabled()) {
      if (tech === 'all' && environment.map.ispStyleUrl) {
        tech =
          this.form.controls.providerType.value === this.providerTypes[1].value
            ? 'all_isp'
            : 'all_mno'
      }
      this.store.dispatch(loadNationalTable({ filters: { tech } }))
    } else {
      this.store.dispatch(loadNationalTable({ filters: { tech, platforms } }))
    }
  }

  private setMunicipalities(municipalities?: IMunicipality[] | null) {
    if (!municipalities) {
      this.filteredMunicipalities$.next(null)
      return
    }
    const muncsByCounty: { [key: string]: IMunicipality[] } =
      municipalities?.reduce((acc, munc) => {
        if (!munc.county?.id) {
          return { ...acc, [munc.id]: [munc] }
        }
        return {
          ...acc,
          // @ts-ignore
          [munc.county.id]: [...(acc[munc.county.id] || []), munc],
        }
      }, {}) || {}

    const muncsByCountyArr = Object.values(muncsByCounty)
      .map((muncs) => ({
        county: muncs[0].county || muncs[0],
        municipalities: muncs.sort((a, b) =>
          a.name.localeCompare(b.name, getDefaultLang(this.transloco)),
        ),
      }))
      .sort((a, b) =>
        a.county?.name.localeCompare(
          b.county?.name,
          getDefaultLang(this.transloco),
        ),
      )

    this.filteredMunicipalities$.next(
      muncsByCountyArr.length ? muncsByCountyArr : null,
    )
  }

  private setOperatorColumnName(providerType: string) {
    for (const col of this.columns) {
      if (col.columnDef === 'providerName') {
        if (providerType === this.providerTypes[0].value) {
          col.header = 'statistics.table.operators'
        } else {
          col.header = 'statistics.table.fixed_line_operators'
        }
      }
    }
  }

  private toggleTechSelect(providerType: string) {
    if (providerType === this.providerTypes[0].value) {
      this.form.controls.tech.enable()
    } else {
      this.form.controls.tech.disable()
      this.form.controls.tech.patchValue(this.techOptions[0].value)
    }
  }
}
