import { Pipe, PipeTransform } from '@angular/core'
import { ITranslatable } from '../../../../core/interfaces/translatable.interface'
import { TranslocoService } from '@ngneat/transloco'
import { MarkdownService } from 'ngx-markdown'
import { markExternalLinks } from 'src/app/core/helpers/mark-external-links'

@Pipe({
  name: 'translate',
})
export class TranslatePipe implements PipeTransform {
  constructor(
    private markdown: MarkdownService,
    private transloco: TranslocoService
  ) {}

  transform(
    value: ITranslatable,
    key: string,
    parseMarkdown: 'parseMarkdown' | 'skipMarkdown' = 'skipMarkdown'
  ): string {
    let retVal = value && value[key]
    if (value && value.translations) {
      const translation = value.translations.find(
        (t) => t.language === this.transloco.getActiveLang()
      )
      if (translation && translation[key]) {
        retVal = translation[key]
      }
    }
    markExternalLinks()
    if (parseMarkdown === 'parseMarkdown') {
      return this.markdown.parse(retVal)
    }
    return retVal
  }
}
