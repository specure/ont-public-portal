import { Pipe, PipeTransform } from '@angular/core'
import { MarkdownService } from 'ngx-markdown'
import { markExternalLinks } from 'src/app/core/helpers/mark-external-links'

@Pipe({
  name: 'markdown',
  standalone: false,
})
export class MarkdownPipe implements PipeTransform {
  constructor(private markdown: MarkdownService) {}

  transform(value: string): Promise<string> {
    markExternalLinks()
    return this.markdown.parse(value) as Promise<string>
  }
}
