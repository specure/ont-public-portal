import { Component } from '@angular/core'
import { TranslocoService } from '@ngneat/transloco'
import { Store } from '@ngrx/store'
import { map, withLatestFrom } from 'rxjs'
import { ConfigService } from 'src/app/core/services/config.service'
import { IAppState } from 'src/app/store'
import { getArticlesState } from 'src/app/store/articles/articles.reducer'
import { IArticle } from '../../interfaces/article.interface'
import { marked } from 'marked'
import { TranslatePipe } from 'src/app/modules/shared/partials/pipes/translate.pipe'
import {
  parseFigures,
  parseUnderlinedText,
} from 'src/app/core/helpers/parse-custom-tags'

@Component({
  selector: 'nt-full-article',
  templateUrl: './full-article.component.html',
  styleUrls: ['./full-article.component.scss'],
})
export class FullArticleComponent {
  article$ = this.store.select(getArticlesState).pipe(
    withLatestFrom(this.config.defaultArticleCover$),
    map(([s, defaultCover]) => {
      if (!s.article) {
        return null
      }
      this.cover =
        this.config.getFullImageUrl(s.article.picture?.url) ?? defaultCover
      const translatedContent = parseUnderlinedText(
        this.translate.transform(s.article, 'content')
      )
      const content = parseFigures(marked.parse(translatedContent) as string)
      return { ...s.article, content }
    })
  )
  cover: string

  get activeLanguage() {
    return this.transloco.getActiveLang()
  }

  constructor(
    private store: Store<IAppState>,
    private config: ConfigService,
    private transloco: TranslocoService,
    private translate: TranslatePipe
  ) {}
}
