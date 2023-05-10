import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'articleClasses',
})
export class ArticleClassesPipe implements PipeTransform {
  transform(index: number): string[] {
    const classList = ['nt-article']
    switch (index) {
      case 0:
        classList.push('nt-article--primary')
        break
      case 1:
      case 2:
        classList.push('nt-article--secondary')
        break
      default:
        classList.push('nt-article--tertiary')
        break
    }
    return classList
  }
}
