import { Component, computed, input } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { TestServer } from '../../classes/test-server.class'
import { SharedModule } from 'src/app/modules/shared/shared.module'

@Component({
    selector: 'nt-test-server-popup',
    imports: [MatButtonModule, SharedModule],
    templateUrl: './test-server-popup.component.html',
    styleUrl: './test-server-popup.component.scss'
})
export class TestServerPopupComponent {
  server = input.required<TestServer>()
  formattedServer = computed(() => {
    const country = this.server().name ?? this.server().country ?? ''
    const city = this.server().city ?? 'N/A'
    const address = this.server().address ?? 'N/A'
    const distance = this.server().distance
      ? `${this.server().distance} km`
      : 'N/A'
    const ipv6 = this.server().ipV6Support ? 'Yes' : 'No'
    const ipv4 = this.server().ipV4Support ? 'Yes' : 'No'
    const dedicated = this.server().dedicated ? 'Yes' : 'No'
    return {
      country,
      city,
      address,
      distance,
      ipv6,
      ipv4,
      dedicated,
    }
  })
}
