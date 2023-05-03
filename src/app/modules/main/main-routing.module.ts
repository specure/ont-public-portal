import { RouterModule, Routes } from '@angular/router'
import { NgModule } from '@angular/core'
import { ERoutes } from 'src/app/core/enums/routes.enum'
import { MainComponent } from './main.component'
import { loadPage, setLanguage } from 'src/app/store/main/main.action'
import { PathResolver } from 'src/app/core/resolvers/path.resolver'
import { RouteParamsResolver } from 'src/app/core/resolvers/route-params.resolver'
import { RedirectResolver } from 'src/app/core/resolvers/redirect.resolver'
import { ArticleComponent } from '../shared/article/article.component'
import { MainArticleLayout } from './classes/main-article-layout.class'
import { LanguageAvailableGuard } from 'src/app/core/guards/language-available.guard'
import { TestComponent } from './modules/test/test.component'
import { ContactComponent } from './components/contact/contact.component'

export const mainRouting: Routes = [
  {
    path: ':lang',
    component: MainComponent,
    canActivate: [LanguageAvailableGuard],
    resolve: { state: RouteParamsResolver },
    data: { action: setLanguage },
    children: [
      {
        path: '',
        resolve: { state: RedirectResolver },
        data: { redirectTo: ERoutes.TEST },
        pathMatch: 'full',
        component: TestComponent,
      },
      {
        path: ERoutes.TEST,
        loadChildren: () =>
          import('./modules/test/test.module').then((m) => m.TestModule),
      },
      {
        path: ERoutes.DATA,
        loadChildren: () =>
          import('./modules/data/data.module').then((m) => m.DataModule),
      },
      {
        path: ERoutes.APPS,
        loadChildren: () =>
          import('./modules/apps/apps.module').then((m) => m.AppsModule),
      },
      {
        path: ERoutes.SOLUTIONS,
        loadChildren: () =>
          import('./modules/solutions/solutions.module').then(
            (m) => m.SolutionsModule
          ),
      },
      {
        path: ERoutes.ARTICLES,
        loadChildren: () =>
          import('./modules/articles/articles.module').then(
            (m) => m.ArticlesModule
          ),
      },
      {
        path: ERoutes.TEST_HISTORY,
        resolve: { state: RedirectResolver },
        data: { redirectTo: `${ERoutes.DATA}/${ERoutes.TEST_HISTORY}` },
        pathMatch: 'full',
        runGuardsAndResolvers: 'always',
        component: TestComponent,
      },
      {
        path: ERoutes.CONTACT,
        component: ContactComponent,
        resolve: { props: PathResolver },
        data: {
          action: loadPage,
          path: ERoutes.CONTACT,
          layout: new MainArticleLayout(),
        },
        runGuardsAndResolvers: 'always',
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
  },
  {
    path: '**',
    resolve: { state: RedirectResolver },
    data: { redirectTo: ERoutes.TEST },
    component: MainComponent,
  },
]

@NgModule({
  imports: [RouterModule.forChild(mainRouting)],
  exports: [RouterModule],
})
export class MainRoutingModule {}
