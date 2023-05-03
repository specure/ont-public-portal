import {
  APP_INITIALIZER,
  ErrorHandler,
  NgModule,
  PLATFORM_ID,
} from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'

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
import {
  DOCUMENT,
  isPlatformBrowser,
  registerLocaleData,
  ɵgetDOM,
} from '@angular/common'
import * as Sentry from '@sentry/angular'
import {
  MatomoConsentMode,
  MatomoInitializationMode,
  NgxMatomoTrackerModule,
} from '@ngx-matomo/tracker'
import {
  MATOMO_PAGE_URL_PROVIDER,
  NgxMatomoRouterModule,
} from '@ngx-matomo/router'
import { PrebootModule } from 'preboot'
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
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AppRoutingModule,
    BrowserAnimationsModule,
    EffectsModule.forRoot(APP_EFFECTS),
    HttpClientModule,
    SharedModule,
    StoreModule.forRoot(appReducers, { metaReducers }),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    TranslocoRootModule,
    NgxMatomoTrackerModule.forRoot({
      requireConsent: MatomoConsentMode.COOKIE,
      mode: MatomoInitializationMode.AUTO_DEFERRED,
    }),
    NgxMatomoRouterModule.forRoot({
      delay: 600,
    }),
    PrebootModule.withConfig({ appRoot: 'nt-root', replay: false }),
    RecaptchaV3Module,
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
    {
      provide: APP_INITIALIZER,
      useFactory:
        (document: HTMLDocument, platformId: Object): Function =>
        () => {
          if (isPlatformBrowser(platformId)) {
            const dom = ɵgetDOM().getDefaultDocument()
            const styles = Array.prototype.slice.apply(
              dom.querySelectorAll(`style[ng-transition]`)
            )
            styles.forEach((el) => {
              // Remove ng-transition attribute to prevent Angular appInitializerFactory
              // to remove server styles before preboot complete
              el.removeAttribute('ng-transition')
            })
            document.addEventListener('PrebootComplete', () => {
              // After preboot complete, remove the server scripts
              setTimeout(() => styles.forEach((el) => el.remove()))
            })
            import('@nettest/cookie-widget').then()
          }
        },
      deps: [DOCUMENT, PLATFORM_ID],
      multi: true,
    },
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
