import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { LeavesService } from 'src/app/services/leaves.service';
import { DeclareleaveDialogboxComponent } from 'src/app/shared/declareleave-dialogbox/declareleave-dialogbox.component';
import { PopupComponent } from 'src/app/shared/popup/popup.component';

@Component({
  selector: 'app-manage-leave',
  templateUrl: './manage-leave.component.html',
  styleUrls: ['./manage-leave.component.scss'],
})
export class ManageLeaveComponent implements OnInit {
  constructor(
    private readonly router: Router,
    private readonly leaveService: LeavesService,
    public readonly dialog: MatDialog
  ) {}

  dateform: any;
  row: any = [];
  data: any = [];
  rows: any;
  active = false;
  today = new Date();
  ngOnInit(): void {
    this.dateForm();
    setTimeout(() => {
      this.getLeave();
    }, 0);
  }
  dateForm(): any {
    this.dateform = new FormGroup({
      from: new FormControl('', [Validators.required]),
    });
  }
  getLeave(): any {
    this.leaveService.getLeave().subscribe(
      (resdata) => {
        this.data = resdata;
        for (const key of this.data.leaves) {
          this.active = false;
          const fullFromDate: any = moment.utc(key.from).local();
          if (this.today.getTime() > fullFromDate._d.getTime()) {
            this.active = true;
          }
          this.row.push({
            leave_id: key.leave_id,
            fromdate: key.from,
            todate: key.to,
            reason: key.reason,
            type: key.type,
            active: this.active,
          });
        }
        this.rows = this.row;
      },
      (error) => {
        console.log(error);
      }
    );
  }
  onDateChange(event: any): any {
    const val = moment(event).format('YYYY-MM-DD') + 'T00:00:00.000Z';
    // filter date
    const temp = this.row.filter((d: any) => {
      return d.fromdate.indexOf(val) !== -1 || !val;
    });
    this.rows = temp;
  }
  onReset(): any {
    this.dateform.reset();
    this.row = [];
    this.rows = [];
    this.getLeave();
  }

  arrow(): any {
    this.router.navigate(['']);
  }

  onEditLeave(leavedata: any): any {
    const dialogRef = this.dialog.open(DeclareleaveDialogboxComponent, {
      width: '600px',
      height: '600px',
      autoFocus: false,
      disableClose: true,
      data: {
        leavedata,
      },
    });
    this.EditAndCancelFunError(dialogRef);
  }

  onCancelLeave(event: any): any {
    const leaveId = event.leave_id;
    const dialogRef = this.dialog.open(PopupComponent, {
      width: '400px',
      height: '200px',
      disableClose: true,
      autoFocus: false,
      data: {
        leaveId,
        cancelLeave: 'cancelLeave',
      },
    });
    this.EditAndCancelFunError(dialogRef);
  }

  EditAndCancelFunError(dialogRef: any): any {
    dialogRef.afterClosed().subscribe(() => {
      this.row = [];
      this.rows = [];
      this.getLeave();
    });
  }
}
