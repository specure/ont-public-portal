import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core'
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms'
import { MatRadioModule } from '@angular/material/radio'
import { TranslocoModule } from '@ngneat/transloco'
import { Subject, takeUntil } from 'rxjs'

export type OutFilters = {
  label: string
  tech: string
  style: 'style' | 'ispStyle' | 'allStyle' | 'browserStyle'
  platforms: string[]
}

@Component({
  selector: 'nt-statistics-filters',
  standalone: true,
  imports: [ReactiveFormsModule, MatRadioModule, TranslocoModule],
  templateUrl: './statistics-filters.component.html',
  styleUrl: './statistics-filters.component.scss',
})
export class StatisticsFiltersComponent implements OnInit, OnDestroy {
  @Input() compact = false
  @Output() filtersChange = new EventEmitter<OutFilters>()
  fb = inject(FormBuilder)
  private destroy$ = new Subject<void>()

  form: FormGroup<{
    tech: FormControl<string | null>
    platforms: FormControl<string | null>
  }>
  techOptions = [
    {
      label: 'map.filter.technology.all',
      value: 'all_mno',
      class: 'nt-all-color',
    },
    { value: '5G', class: 'nt-five-g-color' },
    { value: '4G', class: 'nt-four-g-color' },
    { value: '3G', class: 'nt-three-g-color' },
    { value: '2G', class: 'nt-two-g-color' },
  ]
  platformsOptions = [
    { label: 'statistics.filter.all_measurements', value: 'all' },
    { label: 'statistics.filter.app_cellular', value: 'app_cellular' },
    { label: 'statistics.filter.app_wifi', value: 'app_wifi' },
    { label: 'statistics.filter.browser', value: 'browser' },
  ]

  constructor() {
    this.form = this.fb.group({
      tech: new FormControl('all_mno'),
      platforms: new FormControl(this.platformsOptions[0].value),
    })
  }

  ngOnInit(): void {
    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.submit()
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  technologyChanged(tech: string) {
    this.form.patchValue({ tech })
  }

  submit() {
    // Emit the selected filters to the parent component or service
    const filters: OutFilters = {
      label: 'statistics.filter.all_measurements',
      tech: 'all',
      style: 'allStyle',
      platforms: [],
    }
    switch (this.form.value.platforms) {
      case 'app_cellular':
        filters.label = 'statistics.filter.app_cellular'
        filters.tech = this.form.value.tech ?? 'all_mno'
        filters.style = 'style'
        filters.platforms = ['IOS', 'ANDROID']
        break
      case 'app_wifi':
        filters.label = 'statistics.filter.app_wifi'
        filters.tech = 'all_isp'
        filters.style = 'ispStyle'
        filters.platforms = ['IOS', 'ANDROID']
        break
      case 'browser':
        filters.label = 'statistics.filter.browser'
        filters.tech = 'all'
        filters.style = 'browserStyle'
        filters.platforms = ['BROWSER']
        break
    }
    this.filtersChange.emit(filters)
  }
}
