import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EmployeesService } from 'src/app/services/employees.service';
import { DeclareleaveDialogboxComponent } from 'src/app/shared/declareleave-dialogbox/declareleave-dialogbox.component';
import { MyteamDialogboxComponent } from 'src/app/shared/myteam-dialogbox/myteam-dialogbox.component';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})
export class LandingPageComponent {
  constructor(
    public readonly dialog: MatDialog,
    private readonly empService: EmployeesService
  ) {
    const userInfo = JSON.parse(localStorage.getItem('userData'));
    this.empService.userLocalStorage.next(userInfo);
  }

  myTeamDialog(): any {
    this.dialog.open(MyteamDialogboxComponent, {
      width: '600px',
      height: '600px',
      autoFocus: false,
      panelClass: 'myapp-no-padding-dialog',
    });
  }

  declareLeaveDialog(): any {
    this.dialog.open(DeclareleaveDialogboxComponent, {
      width: '600px',
      height: '600px',
      autoFocus: false,
      disableClose: true,
    });
  }
}
