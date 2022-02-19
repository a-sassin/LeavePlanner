import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeclareleaveDialogboxComponent } from './declareleave-dialogbox.component';
import {
  MatDialogModule,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '../shared.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormControl, FormGroup } from '@angular/forms';
import * as moment from 'moment';
import { MatDatepicker } from '@angular/material/datepicker';
import { Moment } from 'moment';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LeavesService } from 'src/app/services/leaves.service';
import { AuthService } from 'src/app/services/auth.service';
import { PublicHolidayService } from 'src/app/services/public-holiday.service';
import { PopupComponent } from '../popup/popup.component';

export class MatDialogMock {
  open(): any {
    return true;
  }
}

describe('DeclareleaveDialogboxComponent', () => {
  let component: DeclareleaveDialogboxComponent;
  let fixture: ComponentFixture<DeclareleaveDialogboxComponent>;
  const matDialog = new MatDialogMock();
  const datepicker = {} as MatDatepicker<moment.Moment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeclareleaveDialogboxComponent],
      imports: [
        MatDialogModule,
        SharedModule,
        HttpClientTestingModule,
        RouterTestingModule,
        MatSnackBarModule,
        MatDialogModule,
      ],
      providers: [
        LeavesService,
        AuthService,
        PublicHolidayService,
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeclareleaveDialogboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should be called', () => {
    spyOn(component, 'formAddLeave');
    spyOn(component, 'checkForm');
    spyOn(component, 'getHolidays');
    component.ngOnInit();
    expect(component.formAddLeave).toHaveBeenCalled();
    expect(component.checkForm).toHaveBeenCalled();
    expect(component.getHolidays).toHaveBeenCalled();
  });

  it('declare leave form should be called', () => {
    expect(
      (component.addLeaveForm = new FormGroup({
        fromDate: new FormControl(moment()),
        toDate: new FormControl(''),
        reason: new FormControl(''),
        type: new FormControl(''),
      }))
    ).toBeTruthy();
  });

  it('chosenYearHandler should be called', () => {
    spyOn(datepicker, 'close');
    component.chosenYearHandler(moment());
    expect(datepicker.close).toHaveBeenCalled();
  });

  it('oncancel should be callled', () => {
    component.onCancel();
    expect(component.addLeaveForm.reset).toHaveBeenCalled();
  });

  it('Call Leave Success Pop Up', () => {
    spyOn(matDialog, 'open');
    const fromDate = '';
    const toDate = '';
    component.leavePopBox(fromDate, toDate);
    expect(matDialog.open).toHaveBeenCalled();
    expect(component.dialog.open).toHaveBeenCalledWith(PopupComponent, {
      width: '500px',
      height: '230px',
      disableClose: true,
      autoFocus: false,
      data: {
        fromDate: '',
        toDate: '',
        leave: 'leave',
      },
    });
  });
});
