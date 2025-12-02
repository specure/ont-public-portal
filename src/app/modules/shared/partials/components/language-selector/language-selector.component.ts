import { Component, OnInit, Input } from '@angular/core'
import { TranslocoService } from '@ngneat/transloco'

import { environment } from 'src/environments/environment'
import { ILocale } from 'src/app/core/interfaces/locale.interface'

@Component({
    selector: 'nt-language-selector',
    templateUrl: './language-selector.component.html',
    styleUrls: ['./language-selector.component.scss'],
    standalone: false
})
export class LanguageSelectorComponent implements OnInit {
  @Input() className: string

  locales: ILocale[] = environment.availableLangs
  selectedLocale: ILocale

  constructor(private transloco: TranslocoService) {}

  ngOnInit() {
    this.selectedLocale = environment.availableLangs.find(
      (l: ILocale) => this.transloco.getActiveLang() === l.iso
    )
  }

  changeLocale() {
    if (!globalThis.location) {
      return
    }
    const hrefParts = globalThis.location.pathname.split('/')
    hrefParts[1] = this.selectedLocale.iso
    globalThis.open(
      `${globalThis.location.protocol}//${
        globalThis.location.host
      }${hrefParts.join('/')}${globalThis.location.search}`,
      '_self'
    )
  }
}
