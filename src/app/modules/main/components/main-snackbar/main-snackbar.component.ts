import { Component, Inject } from '@angular/core'
import { MAT_LEGACY_SNACK_BAR_DATA as MAT_SNACK_BAR_DATA } from '@angular/material/legacy-snack-bar'

@Component({
  selector: 'nt-main-snackbar',
  templateUrl: './main-snackbar.component.html',
  styleUrls: ['./main-snackbar.component.scss'],
})
export class MainSnackbarComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data) {}
}
