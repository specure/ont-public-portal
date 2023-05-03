import { Directive, ElementRef, Input, OnChanges } from '@angular/core'
import { ERoutes } from 'src/app/core/enums/routes.enum'

@Directive({
  selector: '[ntLinkRel]'
})
export class LinkRelDirective implements OnChanges {
  @Input() ntLinkRel: string

  constructor(private el: ElementRef) {}

  ngOnChanges(): void {
    if (
      this.ntLinkRel.includes(ERoutes.TEST_HISTORY) ||
      this.ntLinkRel.includes(ERoutes.TEST_HYSTORY_RESULTS.split('/')[0])
    ) {
      this.el.nativeElement.setAttribute('rel', 'nofollow')
    }
  }
}
