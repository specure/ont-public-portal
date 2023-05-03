import { IArticleLayout } from '../../shared/article/interfaces/article-layout.interface'

export class MainArticleLayout implements IArticleLayout {
    article = '.nt-article'
    aside   = '.nt-aside'
    footer  = 'footer.nt-footer'
    header  = '.nt-header'
    main    = '.nt-layout'
}
