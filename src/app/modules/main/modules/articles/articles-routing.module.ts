import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { Paginator } from 'src/app/core/classes/paginator.class'
import { ERoutes } from 'src/app/core/enums/routes.enum'
import { PathResolver } from 'src/app/core/resolvers/path.resolver'
import { RouteParamsResolver } from 'src/app/core/resolvers/route-params.resolver'
import {
  loadArticles,
  loadFullArticle,
} from 'src/app/store/articles/articles.action'
import { ArticlesComponent } from './articles.component'
import {
  ArticlesListComponent,
  ARTICLES_PAGINATOR_SIZE,
} from './components/articles-list/articles-list.component'
import { FullArticleComponent } from './components/full-article/full-article.component'

const articlesRouting: Routes = [
  {
    path: '',
    component: ArticlesComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        resolve: { props: PathResolver },
        component: ArticlesListComponent,
        data: {
          action: loadArticles,
          path: ERoutes.ARTICLES,
          props: {
            request: {
              sort: null,
              paginator: new Paginator(0, ARTICLES_PAGINATOR_SIZE),
            },
          },
        },
        runGuardsAndResolvers: 'always',
      },
      {
        path: ':slug',
        resolve: { props: RouteParamsResolver },
        component: FullArticleComponent,
        data: { action: loadFullArticle },
        runGuardsAndResolvers: 'always',
      },
    ],
    runGuardsAndResolvers: 'always',
  },
]

@NgModule({
  imports: [RouterModule.forChild(articlesRouting)],
  exports: [RouterModule],
})
export class ArticlesRoutingModule {}
