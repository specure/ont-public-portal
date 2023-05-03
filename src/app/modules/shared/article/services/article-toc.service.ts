import { Injectable } from '@angular/core'
import { IArticleTocItem } from '../interfaces/article-toc-item.interface'

const HEADINGS = ['h2', 'h3']

@Injectable({
  providedIn: 'root',
})
export class ArticleTocService {
  private headerEl: HTMLElement

  constructor() {}

  generate(
    rootPath: string,
    headerEl: HTMLElement,
    documentRef?: Document
  ): IArticleTocItem[] {
    if (!globalThis.document && !documentRef) {
      return null
    }
    this.headerEl = headerEl
    documentRef = documentRef || document
    const topHeadings = [].slice.call(
      documentRef.body.querySelectorAll(HEADINGS[0])
    )
    if (!topHeadings.length) {
      return null
    }
    let headings: any[] = [].slice.call(
      documentRef.body.querySelectorAll(HEADINGS.join(','))
    )
    // Removing duplicates
    const headingsMap: { [key: string]: any } = headings.reduce(
      (acc, h) => ({ ...acc, [h.textContent]: h }),
      {}
    )
    headings = Object.values(headingsMap)
    return (
      headings.map((heading, index) => {
        const path = `toc-${index}`
        heading.setAttribute('class', 'toc-heading')
        this.addAnchorToHeading(heading, path, documentRef)
        return this.addHeadingToToc(heading, rootPath, path)
      }) as IArticleTocItem[]
    ).reduce((acc, item) => {
      if (item.tagName === HEADINGS[0]) {
        return [...acc, item]
      }
      if (acc.length > 0) {
        acc[acc.length - 1].children.push(item)
      }
      return acc
    }, [])
  }

  private addAnchorToHeading(heading, path, documentRef) {
    if (documentRef.getElementById(path)) {
      return
    }
    const anchor = documentRef.createElement('a')
    anchor.setAttribute('name', path)
    anchor.setAttribute('id', path)
    if (this.headerEl) {
      const top =
        this.headerEl.getBoundingClientRect().height +
        parseFloat(globalThis.getComputedStyle(this.headerEl).marginBottom)
      anchor.setAttribute('style', `position: relative; top: -${top}px`)
    }
    heading.parentNode.insertBefore(anchor, heading)
  }

  private addHeadingToToc(heading, rootPath, path): IArticleTocItem {
    const linkId = `${path}-link`
    return {
      children: [],
      href: `${rootPath}#${path}`,
      linkId,
      tagName: heading.tagName.toLowerCase(),
      text: heading.textContent,
    }
  }
}
