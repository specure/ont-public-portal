import { Pipe, PipeTransform } from '@angular/core'
import { IArticle } from '../interfaces/article.interface'

@Pipe({
  name: 'articleAuthor',
})
export class ArticleAuthorPipe implements PipeTransform {
  transform(article: IArticle, t: (key: string) => string): string {
    const { firstname, lastname, username } = article.created_by
    let author = ''
    if (firstname) {
      author = firstname
      if (lastname) {
        author += ` ${lastname}`
      }
    } else {
      author = username
    }
    if (author) {
      return t('articles.created_by').replace('%author%', author)
    }
    return ''
  }
}
