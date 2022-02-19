import { Component, Inject, OnInit } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { EmployeesService } from 'src/app/services/employees.service';
import { LeavesService } from 'src/app/services/leaves.service';
import { MyteamDialogboxComponent } from '../myteam-dialogbox/myteam-dialogbox.component';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
})
export class PopupComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly employee: EmployeesService,
    private readonly snackBar: MatSnackBar,
    public readonly dialogRef: MatDialogRef<PopupComponent>,
    public readonly dialog: MatDialog,
    private readonly leaveService: LeavesService,
    private readonly router: Router
  ) {}

  active = false;
  cancelLeave = false;
  delOwnerFlag = false;

  ngOnInit(): void {
    this.check();
  }
  check(): any {
    if (this.data.leave === 'leave' && this.data.leave !== 'cancelLeave') {
      this.active = true;
    } else if (
      this.data.cancelLeave === 'cancelLeave' &&
      this.data.cancelLeave !== 'leave'
    ) {
      this.cancelLeave = true;
    } else if (
      this.data.flag === 'delOwner' &&
      !(
        this.data.cancelLeave === 'cancelLeave' &&
        this.data.cancelLeave === 'leave'
      )
    ) {
      this.delOwnerFlag = true;
    }
  }
  teamNameLength(name: any): any {
    name = '' + name;
    if (name.length > 12) {
      name = name.slice(0, 12) + '...';
    }
    return name;
  }
  onCancel(): any {
    this.dialogRef.close();
    this.myTeamDialog();
  }
  deleteTeam(teamId): any {
    this.employee.deleteTeam(teamId).subscribe(
      (resdata) => {
        this.dialogRef.close();
        this.myTeamDialog();
        this.snackBar.open(resdata.message, 'Ok', {
          duration: 2000,
        });
      },
      (error) => {
        console.log(error);
      }
    );
  }
  myTeamDialog(): any {
    this.dialog.open(MyteamDialogboxComponent, {
      width: '600px',
      height: '600px',
      autoFocus: false,
      panelClass: 'myapp-no-padding-dialog',
    });
  }
  deleteLeave(leaveId): any {
    this.leaveService.deleteLeave(leaveId).subscribe(
      (res) => {
        this.dialogRef.close();
        this.snackBar.open(res.message, 'Ok', {
          duration: 2000,
        });
      },
      (error) => {
        console.log(error);
      }
    );
  }

  deleteOwner(
    teamId: string,
    teamName: string,
    memberstoadd: any,
    memberstodelete: any
  ): any {
    this.employee
      .updateTeam(teamId, teamName, memberstoadd, memberstodelete)
      .subscribe(
        (resdata) => {
          this.dialogRef.close();
          this.router.navigate(['']);
          this.myTeamDialog();
          this.snackBar.open(resdata.message, 'Ok', {
            duration: 2000,
          });
        },
        (error) => {
          console.log(error);
        }
      );
  }
  onClickNo(): any {
    this.dialogRef.close();
  }
}
