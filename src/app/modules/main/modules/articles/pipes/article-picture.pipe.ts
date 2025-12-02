import { Pipe, PipeTransform } from '@angular/core'
import { ConfigService } from 'src/app/core/services/config.service'
import { IArticle } from '../interfaces/article.interface'

@Pipe({
    name: 'articlePicture',
    standalone: false
})
export class ArticlePicturePipe implements PipeTransform {
  constructor(private config: ConfigService) {}

  transform(article: IArticle, defaultCover: string): string {
    return article?.picture?.url
      ? this.config.getFullImageUrl(article.picture.url)
      : defaultCover
  }
}
