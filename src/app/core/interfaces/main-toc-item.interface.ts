export interface IMainTocItem {
  children: IMainTocItem[],
  class?: string,
  href: string,
  linkId: string,
  style?: string,
  tagName: string,
  text: string
}
