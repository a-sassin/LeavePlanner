import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import * as moment from 'moment';
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import {
  DateAdapter,
  ErrorStateMatcher,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PublicHolidayService } from 'src/app/services/public-holiday.service';
export const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY',
  },
  display: {
    dateInput: 'YYYY',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY',
  },
};

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

@Component({
  selector: 'app-holiday-list',
  templateUrl: './holiday-list.component.html',
  styleUrls: ['./holiday-list.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class HolidayListComponent implements OnInit {
  matcher = new MyErrorStateMatcher();
  minDate: moment.Moment;
  maxDate: moment.Moment;
  constructor(
    private readonly router: Router,
    private readonly holidayService: PublicHolidayService,
    private readonly snackBar: MatSnackBar
  ) {}

  dateForm: any;
  year: any;
  filename = 'Choose a file to upload holiday list';
  @ViewChild('selectfile') selectfile: ElementRef;

  ngOnInit(): void {
    const currentYear = moment().year();
    this.minDate = moment([currentYear]);
    this.maxDate = moment([currentYear + 1]);
    this.dateform();
  }

  dateform(): any {
    this.dateForm = new FormGroup({
      year: new FormControl(moment(), Validators.required),
      file: new FormControl('', Validators.required),
    });
  }

  chosenYearHandler(
    normalizedYear: moment.Moment,
    datepicker: MatDatepicker<moment.Moment>
  ): any {
    this.dateForm.patchValue({
      year: normalizedYear,
    });
    this.year = normalizedYear.year();
    datepicker.close();
  }

  onSelectedFile(event): any {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.dateForm.patchValue({
        file,
      });
    }
    this.filename = event.target.files[0].name;
  }

  arrow(): any {
    this.router.navigate(['']);
  }

  onCancel(): any {
    this.reset();
  }

  onSubmit(): any {
    if (!this.dateForm.valid) {
      return;
    }
    const year = this.dateForm.value.year._d.getFullYear();
    const file = this.dateForm.value.file;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('year', year);
    this.holidayService.uploadHoliday(formData).subscribe(
      (res) => {
        this.snackBar.open(res.message, 'Ok', {
          duration: 1500,
        });
        this.reset();
      },
      (error) => {
        console.log(error);
      }
    );
  }

  reset(): any {
    this.selectfile.nativeElement.value = '';
    this.filename = 'Choose a file to upload holiday list';
    this.dateForm.reset();
  }
}
