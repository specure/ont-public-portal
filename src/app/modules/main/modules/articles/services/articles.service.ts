import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, map, forkJoin } from 'rxjs'
import { IBasicRequest } from 'src/app/core/interfaces/basic-request.interface'
import { IBasicResponse } from 'src/app/core/interfaces/basic-response.interface'
import { environment } from 'src/environments/environment'
import { IArticle } from '../interfaces/article.interface'

@Injectable({
  providedIn: 'root',
})
export class ArticlesService {
  constructor(private http: HttpClient) {}

  getArticlesList(
    request: IBasicRequest
  ): Observable<IBasicResponse<IArticle>> {
    return forkJoin([
      this.http.get<number>(
        this.getApiUrl(`${environment.cms.routes.articles}/count`),
        this.getHttpOptions()
      ),
      this.http.get<IArticle[]>(
        this.getApiUrl(environment.cms.routes.articles),
        this.getHttpOptions({
          params: {
            _limit: request.paginator.size,
            _start: request.paginator.page,
          },
        })
      ),
    ]).pipe(
      map(([totalElements, content]) => {
        return { totalElements, content }
      })
    )
  }

  getFullArticle(slug: string): Observable<IArticle> {
    return this.http.get<IArticle>(
      this.getApiUrl(`${environment.cms.routes.articles}/${slug}`),
      this.getHttpOptions()
    )
  }

  private getApiUrl(path: string) {
    return `${environment.cms.url}${path}`
  }

  private getHttpOptions(options: { [key: string]: any } = {}) {
    return { headers: environment.controlServer.headers, ...options }
  }
}
