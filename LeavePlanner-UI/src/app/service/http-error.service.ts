import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AlertPopupComponent } from '../shared/alert-popup/alert-popup.component';

@Injectable({
  providedIn: 'root',
})
export class HttpErrorService {
  constructor(public readonly dialog: MatDialog) {}
  showError(error: string): any {
    this.dialog.open(AlertPopupComponent, {
      width: '400px',
      data: {
        error,
      },
    });
  }
}
