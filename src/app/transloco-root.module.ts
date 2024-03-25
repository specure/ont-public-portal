import { HttpClient } from '@angular/common/http'
import {
  Translation,
  TranslocoLoader,
  TranslocoModule,
  provideTransloco,
} from '@ngneat/transloco'
import { Injectable, NgModule } from '@angular/core'
import { environment } from '../environments/environment'
import { ILocale } from './core/interfaces/locale.interface'
import { IUITranslation } from './core/interfaces/ui-translation.interface'
import { Observable } from 'rxjs'

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string): Observable<Translation> {
    return this.http.get<IUITranslation[]>(
      `${environment.cms.url}${environment.cms.routes.translations}?locale.iso=${lang}&_limit=1000`,
      {
        headers: {
          ...environment.controlServer.headers,
          'X-Nettest-Client': environment.cms.projectSlug,
        },
      }
    )
  }
}

@NgModule({
  exports: [TranslocoModule],
  providers: [
    provideTransloco({
      config: {
        availableLangs: environment.availableLangs.map((l: ILocale) => l.iso),
        defaultLang: environment.defaultLang,
        fallbackLang: environment.defaultLang,
        // Remove this option if your application doesn't support changing language in runtime.
        reRenderOnLangChange: true,
        prodMode: environment.production,
      },
      loader: TranslocoHttpLoader,
    }),
  ],
})
export class TranslocoRootModule {}
