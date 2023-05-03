import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  ViewChild,
} from '@angular/core'
import { ITechnology } from '../../interfaces/technology.interface'
import { MatLegacySelectChange as MatSelectChange } from '@angular/material/legacy-select'
import { Store } from '@ngrx/store'
import {
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
import { Subscription } from 'rxjs'
import { FormBuilder, FormControl, FormGroup } from '@angular/forms'
import { loadNationalTable } from 'src/app/store/statistics/statistics.action'
import { MainMapService } from '../../services/main-map.service'
import { getMainState } from 'src/app/store/main/main.reducer'

export enum ENetworkOperator {
  ALL = 'map.filter.operators.all',
}

@Component({
  selector: 'nt-map-layer-filter',
  templateUrl: './map-layer-filter.component.html',
  styleUrls: ['./map-layer-filter.component.scss'],
})
export class MapLayerFilterComponent implements AfterViewChecked, OnDestroy {
  @ViewChild('expansionPanel') expansionPanel: MatExpansionPanel

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
      ...s.nationalTable.statsByProvider.map((st) => st.providerName),
    ])
  )
  networkOperator = ENetworkOperator.ALL
  project$ = this.store.select(getMainState).pipe(map((s) => s.project))
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
  providerTypesForm: FormGroup
  selectedProviderType = this.providerTypes[0]

  get isMobile() {
    return this.platform.isMobile
  }

  get isExpanded() {
    return !this.isMobile || this.expansionPanel?.expanded
  }

  constructor(
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private mapper: MainMapService,
    private platform: PlatformService,
    private store: Store<IAppState>
  ) {
    this.resetFilters()
    this.providerTypesForm = this.fb.group({
      providerType: new FormControl(this.providerTypes[0].value),
    })
    this.providerTypesSub =
      this.providerTypesForm.controls.providerType.valueChanges
        .pipe(
          tap((providerType) => {
            this.selectedProviderType = this.providerTypes.find(
              (t) => t.value === providerType
            )
            this.resetFilters()
            this.loadNationalTable()
            this.store.dispatch(
              setStyle({
                style:
                  providerType === 'mno'
                    ? this.mapper.style
                    : this.mapper.ispStyle,
              })
            )
          })
        )
        .subscribe()
  }

  ngOnDestroy(): void {
    this.providerTypesSub?.unsubscribe()
  }

  ngAfterViewChecked(): void {
    this.cdr.detectChanges()
  }

  getOperatorMapKey(providerName: string) {
    return ENetworkOperator[providerName.toUpperCase()] || providerName
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
      this.selectedProviderType.value === 'mno'
        ? this.technologyAll
        : this.ispTechnologies[0]
    this.store.dispatch(
      setMapFilters({
        operator: ENetworkOperator.ALL,
        technology,
      })
    )
  }

  private loadNationalTable() {
    let tech
    if (
      this.providerTypesForm.controls.providerType.value ===
      this.providerTypes[0].value
    ) {
      tech = 'all_mno'
    } else {
      tech = 'all_isp'
    }
    this.store.dispatch(loadNationalTable({ filters: { tech } }))
  }
}
