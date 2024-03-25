import { APP_ID, ErrorHandler, NgModule } from '@angular/core'
import {
  BrowserModule,
  provideClientHydration,
} from '@angular/platform-browser'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { EffectsModule } from '@ngrx/effects'
import { APP_EFFECTS, appReducers, metaReducers } from './store'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { HttpClientModule } from '@angular/common/http'
import { StoreModule } from '@ngrx/store'
import { StoreDevtoolsModule } from '@ngrx/store-devtools'
import { environment } from 'src/environments/environment'
import { CookieService } from 'ngx-cookie-service'
import { TranslocoRootModule } from './transloco-root.module'
import { SharedModule } from './modules/shared/shared.module'
import localeNb from '@angular/common/locales/nb'
import localeSq from '@angular/common/locales/sq'
import localeSk from '@angular/common/locales/sk'
import localeSr from '@angular/common/locales/sr'
import localeSrLatn from '@angular/common/locales/sr-Latn'
import localeDe from '@angular/common/locales/de'
import { registerLocaleData } from '@angular/common'
import * as Sentry from '@sentry/angular-ivy'
import {
  MatomoConsentMode,
  MatomoInitializationMode,
  MATOMO_PAGE_URL_PROVIDER,
  provideMatomo,
  withRouter,
} from 'ngx-matomo-client'
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha'
import { MatomoUrlProviderService } from './core/services/matomo-url-provider.service'
import {
  Chart,
  // ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  // BubbleController,
  // DoughnutController,
  LineController,
  // PieController,
  // PolarAreaController,
  // RadarController,
  // ScatterController,
  CategoryScale,
  LinearScale,
  // LogarithmicScale,
  // RadialLinearScale,
  // TimeScale,
  // TimeSeriesScale,
  // Decimation,
  Filler,
  // Title,
} from 'chart.js'
import { LabelAfterBar } from './core/helpers/chartjs-plugin-label-after-bar'
Chart.register(
  BarElement,
  BarController,
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Filler,
  LabelAfterBar
)

Sentry.init({
  dsn: 'https://e661f4f4c9a54150b7960943b16709f2@o439176.ingest.sentry.io/5405521',
  denyUrls: ['http://localhost', 'http://localhost:4200'],
  ignoreErrors: [
    'ChunkLoadError',
    'Non-Error',
    '<page-ready>',
    'Failed to fetch',
    'Unable to load translation',
    'dataStream',
    'File error: Access denied',
    'vc_request_action',
    'WebGL',
    'dead object',
    'window.webkit.messageHandlers',
    'Partial keyframes',
    'localStorage',
  ],
})

@NgModule({
  declarations: [AppComponent],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    HttpClientModule,
    RecaptchaV3Module,
    SharedModule,
    TranslocoRootModule,
    EffectsModule.forRoot(APP_EFFECTS),
    StoreModule.forRoot(appReducers, { metaReducers }),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
  ],
  providers: [
    CookieService,
    {
      provide: RECAPTCHA_V3_SITE_KEY,
      useValue: environment.recaptchaSiteKey,
    },
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler(),
    },
    {
      provide: MATOMO_PAGE_URL_PROVIDER,
      useClass: MatomoUrlProviderService,
    },
    // SSR flicker solution from https://github.com/angular/preboot/issues/75#issuecomment-421266570
    // {
    //   provide: APP_INITIALIZER,
    //   useFactory:
    //     (document: HTMLDocument, platformId: Object): Function =>
    //     () => {
    //       if (isPlatformBrowser(platformId)) {
    //         const dom = ɵgetDOM().getDefaultDocument()
    //         const styles = Array.prototype.slice.apply(
    //           dom.querySelectorAll(`style[ng-transition]`)
    //         )
    //         styles.forEach((el) => {
    //           // Remove ng-transition attribute to prevent Angular appInitializerFactory
    //           // to remove server styles before preboot complete
    //           el.removeAttribute('ng-transition')
    //         })
    //         document.addEventListener('PrebootComplete', () => {
    //           // After preboot complete, remove the server scripts
    //           setTimeout(() => styles.forEach((el) => el.remove()))
    //         })
    //         import('@nettest/cookie-widget').then()
    //       }
    //     },
    //   deps: [DOCUMENT, PLATFORM_ID],
    //   multi: true,
    // },
    { provide: APP_ID, useValue: 'serverApp' },
    provideMatomo(
      {
        requireConsent: MatomoConsentMode.COOKIE,
        mode: MatomoInitializationMode.AUTO_DEFERRED,
      },
      withRouter({
        delay: 600,
      })
    ),
    provideClientHydration(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor() {
    registerLocaleData(localeNb)
    registerLocaleData(localeSq)
    registerLocaleData(localeSk)
    registerLocaleData(localeSr)
    registerLocaleData(localeSrLatn)
    registerLocaleData(localeDe)
  }
}
