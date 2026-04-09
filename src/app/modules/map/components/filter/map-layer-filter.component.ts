import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core'
import { ITechnology } from '../../interfaces/technology.interface'
import { MatSelect, MatSelectChange } from '@angular/material/select'
import { Store } from '@ngrx/store'
import {
  getProviders,
  setMapFilters,
  setOperator,
  setStyle,
  setTechnology,
} from '../../../../store/map/map.action'
import { PlatformService } from 'src/app/core/services/platform.service'
import { MatExpansionPanel } from '@angular/material/expansion'
import { getStatisticsState } from 'src/app/store/statistics/statistics.reducer'
import { filter, map, tap } from 'rxjs/operators'
import { IAppState } from 'src/app/store'
import { BehaviorSubject, combineLatest, Subscription } from 'rxjs'
import { FormBuilder, FormControl, FormGroup } from '@angular/forms'
import { loadNationalTable } from 'src/app/store/statistics/statistics.action'
import { MainMapService } from '../../services/main-map.service'
import { getMainState } from 'src/app/store/main/main.reducer'
import { environment } from 'src/environments/environment'
import { toSignal } from '@angular/core/rxjs-interop'
import { OutFilters } from 'src/app/modules/main/modules/data/components/statistics-filters/statistics-filters.component'
import { getMapState } from 'src/app/store/map/map.reducer'

export enum ENetworkOperator {
  ALL = 'map.filter.operators.all',
}

@Component({
  selector: 'nt-map-layer-filter',
  templateUrl: './map-layer-filter.component.html',
  styleUrls: ['./map-layer-filter.component.scss'],
  standalone: false,
})
export class MapLayerFilterComponent implements AfterViewChecked, OnDestroy {
  @ViewChild('expansionPanel') expansionPanel: MatExpansionPanel | undefined
  @ViewChild('expansionPanelV2') expansionPanelV2: MatExpansionPanel | undefined
  @ViewChild('shortExpansionPanel') shortExpansionPanel:
    | MatExpansionPanel
    | undefined
  @ViewChild('operatorsSelect')
  operatorsSelect: MatSelect | undefined

  technologyAll: ITechnology = {
    key: 'ALL',
    label: 'map.filter.technology.all',
    class: 'nt-all-color',
  }
  mnoTechnologies: ITechnology[] = [
    { key: '2G', label: '2G', class: 'nt-two-g-color' },
    { key: '3G', label: '3G', class: 'nt-three-g-color' },
    { key: '4G', label: '4G', class: 'nt-four-g-color' },
    { key: '5G', label: '5G', class: 'nt-five-g-color' },
    this.technologyAll,
  ]
  ispTechnologies: ITechnology[] = [
    {
      key: 'WLAN',
      label: 'WLAN',
      class: 'nt-all-color',
    },
  ]
  technology = this.technologyAll
  networkOperators$ = this.store.select(getStatisticsState).pipe(
    filter((s) => !!s.nationalTable),
    map((s) => [
      ENetworkOperator.ALL,
      ...(s.nationalTable?.statsByProvider.map((st) => st.providerName) ?? []),
    ]),
  )
  networkOperator = ENetworkOperator.ALL
  project$ = this.store
    .select(getMainState)
    .pipe(map((s) => s.project))
    .pipe(
      tap((project) => {
        if (project?.enable_filters_v2) {
          this.store.dispatch(getProviders())
        }
      }),
    )
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
  providerTypesSub: Subscription | undefined
  providerTypesForm: FormGroup | undefined
  selectedProviderType: { value: string; label: string } | undefined =
    this.providerTypes[0]
  filtersV2Enabled = toSignal(
    this.store
      .select(getMainState)
      .pipe(map(({ project }) => project?.enable_filters_v2)),
  )
  lastFilters = signal<OutFilters>({
    label: 'statistics.filter.all_measurements',
    tech: 'all',
    style: 'allStyle',
    platforms: [],
  })
  providerFilter$ = new BehaviorSubject<'all' | 'mno'>('all')
  providers$ = combineLatest([
    this.providerFilter$,
    this.store.select(getMapState),
  ]).pipe(
    map(([filter, mapState]) => {
      return [
        ENetworkOperator.ALL,
        ...new Set(
          mapState.providers
            .filter((p) =>
              filter === 'mno'
                ? p.provider?.mnoActive
                : p.provider?.mnoActive || p.provider?.ispActive,
            )
            .map((p) => p.provider?.name),
        ),
      ]
    }),
  )

  get isMobile() {
    return this.platform.isMobile
  }

  get isExpanded() {
    return !this.isMobile || this.expansionPanel?.expanded
  }

  get disableProviderFilter() {
    return environment.map.disableProviderFilter
  }

  constructor(
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private mapper: MainMapService,
    private platform: PlatformService,
    private store: Store<IAppState>,
  ) {
    this.resetFilters()
    this.initProviderFilter()
  }

  ngOnDestroy(): void {
    this.providerTypesSub?.unsubscribe()
  }

  ngAfterViewChecked(): void {
    this.cdr.detectChanges()
  }

  getOperatorMapKey(providerName: string) {
    return (
      ENetworkOperator[
        providerName.toUpperCase() as keyof typeof ENetworkOperator
      ] || providerName
    )
  }

  operatorChanged(event: MatSelectChange) {
    this.networkOperator = event.value
    this.store.dispatch(setOperator({ operator: event.value }))
  }

  shouldShowTechButton(tech: ITechnology) {
    return (
      !this.isMobile ||
      this.expansionPanel?.expanded ||
      this.technology === tech
    )
  }

  technologyChanged(tech: ITechnology) {
    this.technology = tech
    this.store.dispatch(setTechnology({ technology: tech }))
  }

  private resetFilters() {
    const technology =
      this.selectedProviderType?.value === 'mno'
        ? this.technologyAll
        : this.ispTechnologies[0]
    this.store.dispatch(
      setMapFilters({
        operator: ENetworkOperator.ALL,
        technology,
      }),
    )
  }

  private initProviderFilter() {
    this.providerTypesForm = this.fb.group({
      providerType: new FormControl(this.providerTypes[0].value),
    })
    this.providerTypesSub =
      this.providerTypesForm.controls.providerType.valueChanges
        .pipe(
          tap((providerType) => {
            this.selectedProviderType = this.providerTypes.find(
              (t) => t.value === providerType,
            )
            this.resetFilters()
            this.loadNationalTable()
            this.store.dispatch(
              setStyle({
                style:
                  providerType === 'mno'
                    ? this.mapper.style
                    : this.mapper.ispStyle,
              }),
            )
          }),
        )
        .subscribe()
  }

  private loadNationalTable() {
    if (this.disableProviderFilter) {
      return
    }
    let tech = 'all'
    if (environment.map.ispStyleUrl) {
      tech =
        this.providerTypesForm?.controls.providerType.value ===
        this.providerTypes[1].value
          ? 'all_isp'
          : 'all_mno'
    }
    this.store.dispatch(loadNationalTable({ filters: { tech } }))
  }

  handleFiltersChange(event: OutFilters) {
    const technology =
      event.tech === 'all_isp'
        ? this.ispTechnologies[0]
        : event.tech === 'all'
          ? this.technologyAll
          : this.mnoTechnologies.find((t) => event.tech === t.key) ||
            this.technologyAll
    const style = this.mapper[event.style]
    if (this.lastFilters().style !== event.style) {
      if (event.tech !== 'all' && event.tech !== 'all_isp') {
        this.providerFilter$.next('mno')
      } else {
        this.providerFilter$.next('all')
      }
      this.networkOperator = ENetworkOperator.ALL
      this.store.dispatch(
        setMapFilters({
          operator: ENetworkOperator.ALL,
          technology,
        }),
      )
      this.store.dispatch(
        setStyle({
          style,
        }),
      )
    } else if (this.lastFilters().tech !== event.tech) {
      this.technologyChanged(technology)
    }
    this.lastFilters.set(event)
  }
}
