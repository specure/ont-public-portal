export interface IArticleTocItem {
  children: IArticleTocItem[],
  class?: string,
  href: string,
  linkId: string,
  style?: string,
  tagName: string,
  text: string
}
