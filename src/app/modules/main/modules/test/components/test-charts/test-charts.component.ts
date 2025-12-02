import { Component, input } from '@angular/core'
import { PlatformService } from 'src/app/core/services/platform.service'

@Component({
  selector: 'nt-test-charts',
  standalone: false,
  templateUrl: './test-charts.component.html',
  styleUrl: './test-charts.component.scss',
})
export class TestChartsComponent {
  get chartWidth(): number {
    const chartWidthList = [
      {
        check: this.platform.isMobile || this.platform.isTab,
        width: globalThis.innerWidth - 60,
      },
      {
        check: this.platform.isDesktop,
        width: Math.round(
          (globalThis.document?.querySelector('nt-test-home')?.clientWidth ??
            0) /
            2 -
            29
        ),
      },
    ]

    return chartWidthList?.find(({ check }) => check)?.width ?? 0
  }

  constructor(private readonly platform: PlatformService) {}
}
