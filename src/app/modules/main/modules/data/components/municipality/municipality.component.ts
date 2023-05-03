import { Component, OnDestroy } from '@angular/core'
import { FormBuilder, FormControl, FormGroup } from '@angular/forms'
import { TranslocoService } from '@ngneat/transloco'
import { select, Store } from '@ngrx/store'
import { Subscription } from 'rxjs'
import { map, filter, pluck, withLatestFrom, tap } from 'rxjs/operators'
import { Sort } from 'src/app/core/classes/sort.class'
import { ERoutes } from 'src/app/core/enums/routes.enum'
import { ConfigService } from 'src/app/core/services/config.service'
import { IMainProject } from 'src/app/modules/main/interfaces/main-project.interface'
import { MainHttpService } from 'src/app/modules/main/services/main-http.service'
import { ITableColumn } from 'src/app/modules/shared/tables/interfaces/table-column.interface'
import { IAppState } from 'src/app/store'
import { getMainState } from 'src/app/store/main/main.reducer'
import { setMunicipality } from 'src/app/store/map/map.action'
import { loadNationalTable } from 'src/app/store/statistics/statistics.action'
import { getStatisticsState } from 'src/app/store/statistics/statistics.reducer'
import { environment } from 'src/environments/environment'
import { IMunicipality } from '../../interfaces/municipality.interface'
import { IProviderStats } from '../../interfaces/provider-stats.interface'
import { StatisticsService } from '../../services/statistics.service'
import { NATIONAL_TABLE_COLS } from '../statistics/statistics.component'

@Component({
  selector: 'nt-municipality',
  templateUrl: './municipality.component.html',
  styleUrls: ['./municipality.component.scss'],
})
export class MunicipalityComponent implements OnDestroy {
  action = loadNationalTable
  images: {
    banner?: string
    coat_of_arms?: string
    map_view?: string
  }
  columns: ITableColumn<IProviderStats>[] = []
  form: FormGroup
  municiaplity$ = this.store.pipe(
    select(getStatisticsState),
    filter((s) => !!s.municipality),
    pluck('municipality'),
    withLatestFrom(this.config.defaultMunicipalityBanner$),
    map(([munc, defaultBanner]) => {
      this.images = {}
      const arr = ['banner', 'coat_of_arms', 'map_view']
      arr.forEach((key) => {
        if (munc[key]?.url) {
          this.images[key] = this.config.getFullImageUrl(munc[key].url)
        } else if (key === 'banner') {
          this.images[key] = defaultBanner
        }
      })
      return munc
    })
  )
  nationalTable$ = this.store.select(getStatisticsState).pipe(
    filter((s) => !!s.nationalTable || !!s.municipalities),
    withLatestFrom(this.store.select(getMainState)),
    map(([s, { project }]) => {
      const { nationalTable } = s
      this.columns = NATIONAL_TABLE_COLS
      this.subHeaderColumns = NATIONAL_TABLE_COLS.map((col) =>
        this.statistics.buildSubHeader(col, nationalTable)
      )
      this.project = project
      return nationalTable.allMeasurements > 0 ? nationalTable : null
    })
  )
  project: IMainProject
  providerTypes = [
    {
      value: 'all_mno',
      label: 'statistics.table.mno',
    },
    {
      value: 'all_isp',
      label: 'statistics.table.isp',
    },
  ]
  providerTypesSub: Subscription
  sort = new Sort('providerName', 'asc')
  subHeaderColumns: ITableColumn<IProviderStats>[] = []
  mapLayout = environment.municipality?.mapLayout

  get mapLink() {
    return `/${this.transloco.getActiveLang()}/${ERoutes.MAP}`
  }

  get statisticsLink() {
    return `/${this.transloco.getActiveLang()}/${ERoutes.DATA}/${
      ERoutes.STATISTICS
    }`
  }

  constructor(
    private config: ConfigService,
    private fb: FormBuilder,
    private mainHttp: MainHttpService,
    private statistics: StatisticsService,
    private store: Store<IAppState>,
    private transloco: TranslocoService
  ) {
    this.form = this.fb.group({
      providerType: new FormControl(this.providerTypes[0].value),
    })
    this.providerTypesSub = this.form.controls.providerType.valueChanges
      .pipe(
        withLatestFrom(this.store.select(getStatisticsState)),
        tap(([tech, state]) => {
          this.setOperatorColumnName(tech)
          this.store.dispatch(
            loadNationalTable({ filters: { ...state.filters, tech } })
          )
        })
      )
      .subscribe()
  }

  ngOnDestroy(): void {
    this.providerTypesSub?.unsubscribe()
  }

  setMapMunicipality(munc: IMunicipality) {
    this.store.dispatch(
      setMunicipality({
        municipality: munc.county
          ? `${munc.name}, ${munc.county.name}`
          : munc.name,
      })
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
}
