import { Component, Inject } from '@angular/core'
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar'

@Component({
    selector: 'nt-main-snackbar',
    templateUrl: './main-snackbar.component.html',
    styleUrls: ['./main-snackbar.component.scss'],
    standalone: false
})
export class MainSnackbarComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data) {}
}
