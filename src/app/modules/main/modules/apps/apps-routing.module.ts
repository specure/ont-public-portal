import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { ERoutes } from 'src/app/core/enums/routes.enum'
import { PathResolver } from 'src/app/core/resolvers/path.resolver'
import { RedirectResolver } from 'src/app/core/resolvers/redirect.resolver'
import { ErrorsComponent } from 'src/app/modules/errors/errors.component'
import { ArticleComponent } from 'src/app/modules/shared/article/article.component'
import { loadPage } from 'src/app/store/main/main.action'
import { MainArticleLayout } from '../../classes/main-article-layout.class'
import { AppsComponent } from './apps.component'

const appsRouting: Routes = [
  {
    path: '',
    component: AppsComponent,
    children: [
      {
        path: '',
        resolve: { state: RedirectResolver },
        data: { redirectTo: ERoutes.APPS_ANDROID },
        pathMatch: 'full',
        component: ArticleComponent,
      },
      {
        path: '**',
        component: ArticleComponent,
        resolve: { props: PathResolver },
        data: {
          action: loadPage,
          layout: new MainArticleLayout(),
        },
        runGuardsAndResolvers: 'always',
      },
    ],
    runGuardsAndResolvers: 'always',
  },
]

@NgModule({
  imports: [RouterModule.forChild(appsRouting)],
  exports: [RouterModule],
})
export class AppsRoutingModule {}
