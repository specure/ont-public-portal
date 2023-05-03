import { Pipe, PipeTransform, SecurityContext } from '@angular/core'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'

@Pipe({
  name: 'mainSafeHtml',
})
export class MainSafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string, eventHandlersReplacement: string = ''): SafeHtml {
    const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, value)
    if (sanitized) {
      const replaced = sanitized.replace(
        /href="unsafe:\S*"/gi,
        eventHandlersReplacement
      )
      return this.sanitizer.bypassSecurityTrustHtml(replaced)
    }
    return sanitized
  }
}
