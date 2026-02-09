import { Pipe, PipeTransform } from '@angular/core'
import { ITranslatable } from '../../../../core/interfaces/translatable.interface'
import { TranslocoService } from '@ngneat/transloco'

@Pipe({
  name: 'translate',
  standalone: false,
})
export class TranslatePipe implements PipeTransform {
  constructor(private transloco: TranslocoService) {}

  transform(value: ITranslatable, key: string): string {
    let retVal = value && value[key]
    if (value && value.translations) {
      const translation = value.translations.find(
        (t) => t.language === this.transloco.getActiveLang(),
      )
      if (translation && translation[key]) {
        retVal = translation[key]
      }
    }
    return retVal
  }
}
