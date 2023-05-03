import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core'
import { TranslocoService } from '@ngneat/transloco'
import { debounceTime, fromEvent, tap } from 'rxjs'
import { ESpeedUnits } from 'src/app/core/enums/speed-units.enum'
import { convertBytes } from 'src/app/core/helpers/convert-bytes'
import { PlatformService } from 'src/app/core/services/platform.service'
import { INationalTable } from '../../interfaces/national-table.interface'
import { IProviderStats } from '../../interfaces/provider-stats.interface'

const LABEL_HEIGHT = 64
const CHAR_WIDTH = 8

const CHART_MAX_OPTIONS = [
  5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000,
]

@Component({
  selector: 'nt-statistics-chart',
  templateUrl: './statistics-chart.component.html',
  styleUrls: ['./statistics-chart.component.scss'],
})
export class StatisticsChartComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input() data: INationalTable

  id = 'tech_chart'
  chart: any
  chartHeight = 100

  private onResizeSub = fromEvent(globalThis, 'resize')
    .pipe(
      debounceTime(150),
      tap(() => {
        this.updateChart()
      })
    )
    .subscribe()

  constructor(
    private platform: PlatformService,
    private transloco: TranslocoService
  ) {}

  ngOnDestroy(): void {
    this.onResizeSub?.unsubscribe()
  }

  ngAfterViewInit(): void {
    this.initChart().then(() => this.updateChart())
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('data' in changes) {
      this.updateChart()
    }
  }

  private async initChart() {
    if (this.chart || !globalThis.document) {
      return
    }
    const ctx = (
      document.getElementById(this.id) as HTMLCanvasElement
    )?.getContext('2d')
    if (!ctx) {
      return
    }
    const { StatisticsChart } = await import(
      '../../classes/statistics-chart.class'
    )
    this.chart = new StatisticsChart(ctx, [
      {
        backgroundColor: ['rgba(64, 105, 242, 1)'],
        data: [],
        label: this.transloco.translate('test.download.label'),
        barPercentage: 0.5,
        borderRadius: 5,
        categoryPercentage: 0.6,
      },
      {
        backgroundColor: 'rgba(64, 105, 242, 0.5)',
        data: [],
        label: this.transloco.translate('test.upload.label'),
        barPercentage: 0.5,
        borderRadius: 5,
        categoryPercentage: 0.6,
      },
    ])
  }

  private updateChart() {
    if (!this.chart) {
      return
    }
    this.chart.options.barLabels = []
    this.chart.data.labels = []
    this.chart.data.datasets.forEach((ds) => (ds.data = []))
    this.setLeftPadding()
    this.setFontSize()
    let [max] = this.findUnits()
    this.data?.statsByProvider.forEach(
      (st, i) => (max = this.drawBars(st, i, max))
    )
    this.setChartWidth(max)
    this.setChartHeight()
    this.chart.update()
  }

  private findUnits() {
    let max = 0
    let units
    let unitsLabel
    this.data?.statsByProvider.forEach((st) => {
      const down = convertBytes(+st.download).to(ESpeedUnits.MBPS)
      const up = convertBytes(+st.upload).to(ESpeedUnits.MBPS)
      max = Math.max(max, down, up)
    })
    if (max > 1) {
      units = ESpeedUnits.MBPS
      unitsLabel = this.transloco.translate('statistics.units.mbps')
    } else {
      units = ESpeedUnits.KBPS
      unitsLabel = this.transloco.translate('statistics.units.kbps')
    }
    return [max, units, unitsLabel]
  }

  private drawBars(st: IProviderStats, i: number, max: number) {
    const [_, units, unitsLabel] = this.findUnits()
    this.chart.data.labels[i] = this.getShortName(st.providerName)
    const down = convertBytes(+st.download).to(units)
    const up = convertBytes(+st.upload).to(units)
    this.chart.data.datasets[0].data[i] = down
    this.chart.data.datasets[1].data[i] = up
    this.chart.options.barLabels[i] = [
      `${down.toLocaleString()} ${unitsLabel}`,
      `${up.toLocaleString()} ${unitsLabel}`,
    ]
    return Math.max(max, down, up)
  }

  private setLeftPadding() {
    this.chart.options.layout.padding.left = this.platform.isMobile ? 80 : 120
    this.chart.options.scales.y.ticks.padding = this.platform.isMobile
      ? -29
      : -43
  }

  private setFontSize() {
    const fontSize = this.platform.isMobile ? 12 : 14
    this.chart.options.plugins.label_after_bar.font = `${fontSize}px sans-serif`
    this.chart.options.scales.y.ticks.font.size = fontSize
  }

  private setChartHeight() {
    this.chartHeight =
      this.chart.options.barLabels.length * LABEL_HEIGHT +
      this.chart.options.scales.x.ticks.padding +
      this.chart.options.scales.y.ticks.font.size * 3
  }

  private setChartWidth(max: number) {
    const rounded = Math.round(max)
    const foundMax =
      CHART_MAX_OPTIONS.find((option) => option > rounded * 1.1) ?? 100000
    this.chart.options.scales.x.max = foundMax
    if (foundMax % 4 === 0) {
      this.chart.options.scales.x.ticks.stepSize = foundMax / 4
    } else if (foundMax % 5 === 0) {
      this.chart.options.scales.x.ticks.stepSize = foundMax / 5
    } else {
      this.chart.options.scales.x.ticks.stepSize = 2
    }
  }

  private getShortName(name: string) {
    const maxLengthInChars = this.chart.options.layout.padding.left / CHAR_WIDTH
    return name?.length > maxLengthInChars
      ? `${name.slice(0, maxLengthInChars)}...`
      : name
  }
}
