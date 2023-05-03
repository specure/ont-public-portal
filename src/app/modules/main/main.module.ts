import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MainComponent } from './main.component'
import { MainRoutingModule } from './main-routing.module'
import { SharedModule } from '../shared/shared.module'
import { MainHeaderComponent } from './components/main-header/main-header.component'
import { MainFooterComponent } from './components/main-footer/main-footer.component'
import { MainNavComponent } from './components/main-nav/main-nav.component'
import { MainMenuItemComponent } from './components/main-menu-item/main-menu-item.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ErrorsModule } from '../errors/errors.module'
import { ContactComponent } from './components/contact/contact.component'
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search'
import { MainSnackbarComponent } from './components/main-snackbar/main-snackbar.component'

@NgModule({
  declarations: [
    MainComponent,
    MainHeaderComponent,
    MainFooterComponent,
    MainNavComponent,
    MainMenuItemComponent,
    ContactComponent,
    MainSnackbarComponent,
  ],
  imports: [
    CommonModule,
    MainRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    ErrorsModule,
    NgxMatSelectSearchModule,
  ],
  exports: [MainSnackbarComponent],
})
export class MainModule {}
