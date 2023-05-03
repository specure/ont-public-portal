import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { TranslocoService } from '@ngneat/transloco'
import { Store } from '@ngrx/store'
import { combineLatest, Observable, of } from 'rxjs'
import {
  catchError,
  first,
  map,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs/operators'
import { ESystemMessages } from 'src/app/core/enums/system-messages.enum'
import { IAppState } from 'src/app/store'
import { loadProjectEnd, storeAsset } from 'src/app/store/main/main.action'
import { getMainState } from 'src/app/store/main/main.reducer'

import { environment } from '../../../../environments/environment'
import { MainMenu } from '../classes/main-menu.class'
import { EMenuPlacements } from '../enums/menu-placements.enum'
import { IMainMenu } from '../interfaces/main-menu.interface'
import { IMainPage } from '../interfaces/main-page.interface'
import { IMainProject } from '../interfaces/main-project.interface'
import { IMunicipality } from '../modules/data/interfaces/municipality.interface'
import { IMainVersion } from '../interfaces/main-version.interface'
import { IMainAsset } from '../interfaces/main-asset.interface'
import { ICountry } from '../interfaces/country.interface'
import { IFeedback } from '../interfaces/feedback.interface'

@Injectable({
  providedIn: 'root',
})
export class MainHttpService {
  countries$: Observable<ICountry[]> = this.http
    // .get<ICountry[]>(`https://restcountries.com/v3.1/all?fields=name,flag,cca2`)
    .get<ICountry[]>(environment.countriesUrl)
    .pipe(
      map((countries) => countries ?? []),
      map((countries) =>
        countries.sort((a, b) => (a.name.common > b.name.common ? 1 : -1))
      ),
      catchError(() => of([])),
      shareReplay(1)
    )

  get apiUrl() {
    return environment.cms.url
  }

  get headers() {
    return {
      ...environment.controlServer.headers,
      'X-Nettest-Client': environment.cms.projectSlug,
    }
  }

  get controlServerUrl(): string {
    return environment.controlServer.url
  }

  constructor(
    private http: HttpClient,
    private store: Store<IAppState>,
    private transloco: TranslocoService
  ) {}

  getMenus() {
    return this.http
      .get<IMainMenu[]>(`${this.apiUrl}${environment.cms.routes.menus}`, {
        headers: this.headers,
      })
      .pipe(
        map((menus) => {
          const lang = this.transloco.getActiveLang()
          return {
            headerMenu: MainMenu.findByPlacement(
              menus,
              EMenuPlacements.HEADER
            ).toTree(lang),
            feedbackMenu: MainMenu.findByPlacement(
              menus,
              EMenuPlacements.FEEDBACK
            ),
            footerMenu: MainMenu.findByPlacement(
              menus,
              EMenuPlacements.FOOTER
            ).toTree(lang),
          }
        })
      )
  }

  getMunicipalities() {
    return this.http.get<IMunicipality[]>(
      `${this.apiUrl}${environment.cms.routes.municipalities}`,
      {
        params: new HttpParams({
          fromObject: { _limit: '1000' },
        }),
        headers: this.headers,
      }
    )
  }

  getMunicipality(name: string) {
    return this.http
      .get<IMunicipality[]>(
        `${this.apiUrl}${environment.cms.routes.municipalities}`,
        {
          params: new HttpParams({
            fromObject: { name, _limit: '1' },
          }),
          headers: this.headers,
        }
      )
      .pipe(
        map((m) => {
          if (!m.length) {
            throw new HttpErrorResponse({
              error: { message: ESystemMessages.PAGE_NOT_FOUND },
              status: 404,
            })
          }
          return m[0]
        })
      )
  }

  getPage(route: string): Observable<IMainPage> {
    return this.http.get<IMainPage>(
      `${this.apiUrl}${environment.cms.routes.pages}`,
      {
        params: new HttpParams({
          fromObject: {
            'menu_item.route': route,
            _limit: '1',
          },
        }),
        headers: this.headers,
      }
    )
  }

  getProject(): Observable<IMainProject> {
    return this.http
      .get<IMainProject[]>(`${this.apiUrl}${environment.cms.routes.projects}`, {
        params: new HttpParams({
          fromObject: {
            slug: environment.cms.projectSlug,
            _limit: '1',
          },
        }),
        headers: environment.cms.headers,
      })
      .pipe(
        switchMap((projects) =>
          projects?.length
            ? of(projects)
            : this.http.get<IMainProject>(
                `${this.apiUrl}${environment.cms.routes.projects}`,
                {
                  params: new HttpParams({
                    fromObject: {
                      slug_alt: environment.cms.projectSlug,
                      _limit: '1',
                    },
                  }),
                  headers: environment.cms.headers,
                }
              )
        ),
        map((projects) => projects && projects[0])
      )
  }

  getOrDownloadProject(): Observable<IMainProject> {
    return this.store.select(getMainState).pipe(
      first(),
      switchMap((s) =>
        s?.project
          ? of(s.project)
          : combineLatest([this.getProject(), this.getProjectVersions()]).pipe(
              map(([project, projectVersion]) => {
                project.version = projectVersion
                this.store.dispatch(loadProjectEnd({ project }))
                return project
              }),
              catchError(() => {
                this.store.dispatch(loadProjectEnd({ project: null }))
                return of(null)
              })
            )
      )
    )
  }

  getAssetByName(name: string): Observable<IMainAsset> {
    return this.store.select(getMainState).pipe(
      first(),
      switchMap((s) =>
        s.assets[name]
          ? of(s.assets[name])
          : this.http
              .get<IMainAsset[]>(
                `${this.apiUrl}${environment.cms.routes.uploads}`,
                {
                  params: { name },
                }
              )
              .pipe(
                map((assets) =>
                  assets.length
                    ? {
                        ...assets.sort(
                          (a, b) =>
                            new Date(b.created_at).getTime() -
                            new Date(a.created_at).getTime()
                        )[0],
                        url: `${environment.cms.url}${assets[0].url}`,
                      }
                    : null
                ),
                catchError(() => of(null)),
                tap((asset) =>
                  this.store.dispatch(storeAsset({ key: name, asset }))
                )
              )
      )
    )
  }

  postFeedback(feedback: IFeedback) {
    return this.http.post(
      `${this.apiUrl}${environment.cms.routes.feedback}`,
      feedback
    )
  }

  private getProjectVersions(): Observable<string> {
    return this.http
      .get<IMainVersion[]>(`${this.apiUrl}${environment.cms.routes.versions}`)
      .pipe(
        map(
          (versions) =>
            versions.find((v) => v.component === environment.versionName)
              ?.version ?? 'n/a'
        )
      )
  }
}
