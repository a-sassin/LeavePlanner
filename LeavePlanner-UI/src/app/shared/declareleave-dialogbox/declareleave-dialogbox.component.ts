import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';
import { LeavesService } from 'src/app/services/leaves.service';
import { PopupComponent } from '../popup/popup.component';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCalendarCellClassFunction } from '@angular/material/datepicker';
import { PublicHolidayService } from 'src/app/services/public-holiday.service';

@Component({
  selector: 'app-declareleave-dialogbox',
  templateUrl: './declareleave-dialogbox.component.html',
  styleUrls: ['./declareleave-dialogbox.component.scss'],
})
export class DeclareleaveDialogboxComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly service: LeavesService,
    public readonly dialog: MatDialog,
    private readonly authservice: AuthService,
    private readonly snackBar: MatSnackBar,
    private readonly dialogRef: MatDialogRef<DeclareleaveDialogboxComponent>,
    private readonly holidayservice: PublicHolidayService
  ) { }
  addLeaveForm: FormGroup;

  leaves: string[] = [
    'Family and Emergency Leave',
    'Paternity Leave',
    'Privilege Leave',
    'Unpaid Leave',
    'Adoption Leave',
    'Floating Holiday',
  ];

  nonWhitespaceRegExp: RegExp = new RegExp('\\S');
  active = false;
  title = '';
  year: any;
  holidays: any = [];

  ngOnInit(): void {
    this.year = moment().year();
    setTimeout(() => {
      this.getHolidays(this.year);
    }, 0);
    this.formAddLeave();
    this.checkForm();
  }

  chosenYearHandler(normalizedYear: any): any {
    this.year = normalizedYear.getFullYear();
    this.getHolidays(this.year);
  }

  getHolidays(year: any): any {
    this.holidayservice.getPublicHolidays(year).subscribe((res) => {
      if (res.holiday) {
        for (const holidayDates of res.holiday.holidaysList) {
          this.holidays.push(moment(holidayDates.date)['_d']);
        }
      }
    });
  }

  dateClass: MatCalendarCellClassFunction<Date> = (cellDate) => {
    const date = cellDate.getDate();
    const month = cellDate.getMonth() + 1;
    const year = cellDate.getFullYear();
    for (const i of this.holidays) {
      const yy = i.getFullYear();
      const dd = i.getDate();
      const mm = i.getMonth() + 1;

      if (yy === year) {
        if (mm === month) {
          if (dd === date) {
            return 'example-custom-date-class';
          }
        }
      }
    }
    return '';
  }

  myHolidayFilter = (d: Date): boolean => {
    const time = d.getTime();
    const day = (d || new Date()).getDay();
    return (
      !this.holidays.find((x) => x.getTime() === time) && day !== 0 && day !== 6
    );
  }

  checkForm(): any {
    if (this.data) {
      this.active = true;
      this.title = 'Edit Leave';
      this.setFormValue(this.data);
    } else {
      this.title = 'Declare Leave';
    }
  }

  formAddLeave(): any {
    this.addLeaveForm = new FormGroup({
      fromDate: new FormControl(moment(), [Validators.required]),
      toDate: new FormControl('', [Validators.required]),
      reason: new FormControl('', [
        Validators.required,
        Validators.pattern(this.nonWhitespaceRegExp),
      ]),
      type: new FormControl('', Validators.required),
    });
  }

  setFormValue(data: any): any {
    this.addLeaveForm.setValue({
      fromDate: new Date(this.data.leavedata.fromdate),
      toDate: new Date(this.data.leavedata.todate),
      reason: data.leavedata.reason,
      type: data.leavedata.type,
    });
  }

  onSubmit(): any {
    if (!this.addLeaveForm.valid) {
      return;
    }

    const fromDate = this.addLeaveForm.value.fromDate;
    const startDate = moment(fromDate).format('MM/DD/YYYY');
    const toDate = this.addLeaveForm.value.toDate;
    const endDate = moment(toDate).format('MM/DD/YYYY');
    this.service
      .addLeave(
        startDate,
        endDate,
        this.addLeaveForm.value.reason.trim(),
        this.addLeaveForm.value.type
      )
      .subscribe(
        (res) => {
          this.addLeaveForm.reset();
          this.dialogRef.close();
          this.leavePopBox(fromDate, toDate);
        },
        (error) => {
          console.log(error);
        }
      );
  }

  onUpdateLeave(): any {
    if (!this.addLeaveForm.valid) {
      return;
    }

    const fromDate = this.addLeaveForm.value.fromDate;
    const startDate = moment(fromDate).format('MM/DD/YYYY');
    const toDate = this.addLeaveForm.value.toDate;
    const endDate = moment(toDate).format('MM/DD/YYYY');
    this.service
      .updateleave(
        this.data.leavedata.leave_id,
        startDate,
        endDate,
        this.addLeaveForm.value.reason.trim(),
        this.addLeaveForm.value.type
      )
      .subscribe(
        (resdata) => {
          this.addLeaveForm.reset();
          this.dialogRef.close();
          this.snackBar.open(resdata.message, 'Ok', {
            duration: 1500,
          });
        },
        (error) => {
          console.log(error);
        }
      );
  }

  onCancel(): any {
    this.addLeaveForm.reset();
  }

  leavePopBox(fromDate, toDate): any {
    this.dialog.open(PopupComponent, {
      width: '500px',
      height: '230px',
      disableClose: true,
      autoFocus: false,
      data: {
        fromDate,
        toDate,
        leave: 'leave',
      },
    });
  }
}
