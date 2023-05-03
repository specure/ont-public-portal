import { Injectable } from '@angular/core'
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { SimpleDialogComponent } from '../../modules/shared/dialogs/components/simple-dialog/simple-dialog.component'

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(
    private dialog: MatDialog
  ) { }

  openDialog(msg?: string | object, dialog = SimpleDialogComponent): void {
    if (this.isSameDialogOpen(dialog)) {
      return
    }
    this.dialog.open(dialog, { data: { msg } })
  }

  private isSameDialogOpen(type: typeof SimpleDialogComponent) {
    return this.dialog.openDialogs.filter(dialog => dialog.componentInstance instanceof type).length
  }
}
