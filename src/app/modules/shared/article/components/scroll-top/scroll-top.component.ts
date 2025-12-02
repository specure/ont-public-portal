import { Component } from '@angular/core'
import { map, startWith } from 'rxjs/operators'
import { fromEvent, of } from 'rxjs'
import { IArticleLayout } from '../../interfaces/article-layout.interface'
import { ActivatedRoute } from '@angular/router'

@Component({
    selector: 'nt-scroll-top',
    templateUrl: './scroll-top.component.html',
    styleUrls: ['./scroll-top.component.scss'],
    standalone: false
})
export class ScrollTopComponent {
  bottom = 72
  layout: IArticleLayout = this.route.snapshot.data['layout']
  position = 'fixed'
  visibility$ = of('hidden')

  constructor(private route: ActivatedRoute) {
    if (globalThis.document) {
      this.visibility$ = fromEvent(globalThis, 'scroll').pipe(
        startWith(0),
        map(({ target }: Event) => {
          const footer = document.querySelector(this.layout?.footer)
          const main = document.querySelector(this.layout?.main)
          const { height: footerHeight } = footer?.getBoundingClientRect() || {}
          const mainBottomPadding = parseFloat(
            globalThis.getComputedStyle(main as Element)?.paddingBottom
          )
          const { bottom: articleBottom } = document
            .querySelector(this.layout?.article)
            ?.getBoundingClientRect() || { bottom: 0 }
          const articlePositionFromBottom =
            globalThis.innerHeight - articleBottom
          if (articlePositionFromBottom >= mainBottomPadding) {
            this.position = 'absolute'
          } else {
            this.position = 'fixed'
          }
          this.bottom = mainBottomPadding
          const element = (target as Document)?.scrollingElement
          const scrollTop = element?.scrollTop ?? 0
          return scrollTop > 0 ? 'visible' : 'hidden'
        })
      )
    }
  }

  scroll(): void {
    globalThis.scrollTo(0, 0)
  }
}
