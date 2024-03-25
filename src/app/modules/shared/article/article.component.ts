import { Component, HostListener } from '@angular/core'
import { Observable, BehaviorSubject, timer } from 'rxjs'
import { Store, select } from '@ngrx/store'
import { map } from 'rxjs/operators'
import { marked } from 'marked'
import { trigger, transition, style, animate } from '@angular/animations'
import { IAppState } from '../../../store/index'
import { PlatformService } from 'src/app/core/services/platform.service'
import { getMainState } from 'src/app/store/main/main.reducer'
import { isNullOrUndefined } from 'src/app/core/helpers/util'
import { IArticleLayout } from './interfaces/article-layout.interface'
import { ArticleTocService } from './services/article-toc.service'
import { IArticleTocItem } from './interfaces/article-toc-item.interface'
import { ActivatedRoute } from '@angular/router'
import { TranslatePipe } from '../partials/pipes/translate.pipe'
import {
  parseFigures,
  parseUnderlinedText,
} from 'src/app/core/helpers/parse-custom-tags'
import { openClose } from 'src/app/core/animations/open-close.animation'
import { TranslocoService } from '@ngneat/transloco'

@Component({
  selector: 'nt-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss'],
  animations: [
    openClose,
    trigger('submenuAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)', opacity: 0 }),
        animate('200ms', style({ transform: 'translateY(0)', opacity: 1 })),
      ]),
      transition(':leave', [
        style({ transform: 'translateY(0)', opacity: 1 }),
        animate('200ms', style({ transform: 'translateY(-100%)', opacity: 0 })),
      ]),
    ]),
  ],
})
export class ArticleComponent {
  expandedTocs: number[] = []
  isNullOrUndefined = isNullOrUndefined
  layout: IArticleLayout = this.route.snapshot.data.layout
  page$: Observable<string> = this.store.pipe(
    select(getMainState),
    map((s) => {
      if (!s.page) {
        this.toc$.next(null)
        return ''
      }
      this.title = this.translate.transform(s.page, 'name')

      const translatedPage = parseUnderlinedText(
        this.translate.transform(s.page, 'content')
      )
      if (!translatedPage) {
        this.toc$.next(null)
        return ''
      }
      const parsedPage = parseFigures(marked.parse(translatedPage) as string)
      this.tocIsEnabled =
        s.page.translations?.find(
          (t) => t.language === this.transloco.getActiveLang()
        )?.enable_table_of_contents ??
        s.page.enable_table_of_contents ??
        false
      if (this.tocIsEnabled) {
        timer(0).subscribe(() => {
          const toc = this.tocService.generate(
            globalThis.location?.pathname ?? '',
            globalThis.document?.querySelector(this.layout?.header)
          )
          this.toc$.next(toc)
        })
      }
      return parsedPage
    })
  )
  testStarter = 'onclick="window.startTest();return false;"'
  title: string
  toc$: BehaviorSubject<IArticleTocItem[]> = new BehaviorSubject(null)
  tocIsEnabled = false
  tocStyle = {
    position: this.isDesktop ? 'fixed' : 'static',
    top: 'auto',
  }

  private articleEl: HTMLElement
  private tocEl: HTMLElement
  private headerEl: HTMLElement

  get isDesktop() {
    return this.platform.isDesktop
  }

  get tocHeight() {
    if (!globalThis.document) {
      return 0
    }
    this.headerEl = document.querySelector(this.layout?.header)
    if (!this.headerEl) {
      return 'auto'
    }
    return `${
      globalThis.innerHeight -
      this.headerEl.getBoundingClientRect().height -
      parseFloat(globalThis.getComputedStyle(this.headerEl).marginBottom) -
      20
    }px`
  }

  constructor(
    private platform: PlatformService,
    private route: ActivatedRoute,
    private store: Store<IAppState>,
    private tocService: ArticleTocService,
    private translate: TranslatePipe,
    private transloco: TranslocoService
  ) {}

  isTocItemActive(tocItem: IArticleTocItem) {
    return `#${tocItem?.href?.split('#')[1]}` === globalThis.location?.hash
  }

  shouldExist(tocItem: IArticleTocItem) {
    return tocItem.children && tocItem.children.length
  }

  toggleToc(toc: number) {
    const index = this.expandedTocs.indexOf(toc)
    if (index > -1) {
      this.expandedTocs.splice(index, 1)
    } else {
      this.expandedTocs.push(toc)
    }
    timer(0).subscribe(this.positionToc)
  }

  @HostListener('window:resize')
  private onResize() {
    this.positionToc()
  }

  @HostListener('window:scroll')
  private onScroll() {
    this.positionToc()
  }

  private positionToc = () => {
    this.articleEl = document.querySelector(this.layout?.article)
    this.tocEl = document.querySelector(this.layout?.aside)
    this.headerEl = document.querySelector(this.layout?.header)
    if (!this.isDesktop) {
      this.tocStyle.top = 'auto'
      this.tocStyle.position = 'static'
      return
    }
    if (!this.articleEl || !this.tocEl || !this.headerEl) {
      this.tocStyle.top = 'auto'
      this.tocStyle.position = 'fixed'
      return
    }
    const headerHeightWithMargin =
      this.headerEl.getBoundingClientRect().height +
      parseFloat(globalThis.getComputedStyle(this.headerEl).marginBottom)
    const tocWithHeaderHeight =
      this.tocEl.getBoundingClientRect().height + headerHeightWithMargin
    if (tocWithHeaderHeight >= this.articleEl.getBoundingClientRect().bottom) {
      this.tocStyle.top = `${
        this.articleEl.getBoundingClientRect().height -
        this.tocEl.getBoundingClientRect().height
      }px`
      this.tocStyle.position = 'absolute'
    } else {
      this.tocStyle.top = 'auto'
      this.tocStyle.position = 'fixed'
    }
  }
}
