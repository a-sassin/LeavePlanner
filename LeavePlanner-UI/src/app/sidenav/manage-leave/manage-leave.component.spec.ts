import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import * as moment from 'moment';
import { of, throwError } from 'rxjs';
import { LeavesService } from 'src/app/services/leaves.service';
import { DeclareleaveDialogboxComponent } from 'src/app/shared/declareleave-dialogbox/declareleave-dialogbox.component';
import { PopupComponent } from 'src/app/shared/popup/popup.component';
import { SidenavModule } from '../sidenav.module';

import { ManageLeaveComponent } from './manage-leave.component';

describe('ManageLeaveComponent', () => {
  let component: ManageLeaveComponent;
  let fixture: ComponentFixture<ManageLeaveComponent>;
  let leaveService: LeavesService;
  let dialogSpy: jasmine.Spy;
  const routerSpy = { navigate: jasmine.createSpy('navigate') };
  const dialogRefSpyObj = jasmine.createSpyObj({
    afterClosed: of({}),
    close: null,
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageLeaveComponent],
      imports: [
        SidenavModule,
        RouterTestingModule,
        HttpClientTestingModule,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: MatDialogRef, useValue: {} },
      ],
    }).compileComponents();
    leaveService = TestBed.inject(LeavesService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageLeaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    dialogSpy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(
      dialogRefSpyObj
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should be called', () => {
    spyOn(component, 'dateForm');
    spyOn(component, 'getLeave');
    component.ngOnInit();
    expect(component.dateForm).toHaveBeenCalled();
    expect(component.getLeave).toHaveBeenCalled();
  });

  it('dateForm should be called', () => {
    expect(
      (component.dateform = new FormGroup({
        from: new FormControl(''),
      }))
    ).toBeTruthy();
  });
  it('getLeave should be called', () => {
    const mockres = {
      leaves: [
        {
          empId: 'GS-SE-011',
          from: '2021-04-08T00:00:00.000Z',
          leave_id: '6082527e10cec10012de04bc',
          reason: 'required',
          to: '2021-04-08T00:00:00.000Z',
          type: 'Unplanned Leave',
        },
      ],
    };

    const mockresdata = [
      {
        active: true,
        fromdate: '2021-04-08T00:00:00.000Z',
        leave_id: '6082527e10cec10012de04bc',
        reason: 'required',
        todate: '2021-04-08T00:00:00.000Z',
        type: 'Unplanned Leave',
      },
    ];
    const spyservice = spyOn(leaveService, 'getLeave');
    spyservice.and.returnValue(of(mockres));
    const fullFromDate: any = moment.utc(mockres.leaves[0].from).local();
    expect(component.today.getTime() > fullFromDate._d.getTime()).toBeTrue();
    component.getLeave();
    expect(component.data).toEqual(mockres);
    expect(component.row).toEqual(mockresdata);
    expect(component.rows).toEqual(mockresdata);
    const mockerrorres = { message: 'xyz' };
    spyservice.and.returnValue(throwError(mockerrorres));
    component.getLeave();
  });

  it('for check today date', () => {
    const mockres = {
      leaves: [
        {
          empId: 'GS-SE-011',
          from: '2021-05-29T00:00:00.000Z',
          leave_id: '6082527e10cec10012de04bc',
          reason: 'required',
          to: '2021-04-29T00:00:00.000Z',
          type: 'Unplanned Leave',
        },
      ],
    };

    const mockresdata = [
      {
        active: false,
        fromdate: '2021-05-29T00:00:00.000Z',
        leave_id: '6082527e10cec10012de04bc',
        reason: 'required',
        todate: '2021-04-29T00:00:00.000Z',
        type: 'Unplanned Leave',
      },
    ];
    const spyservice = spyOn(leaveService, 'getLeave');
    spyservice.and.returnValue(of(mockres));
    component.getLeave();
    expect(component.data).toEqual(mockres);
    const fullFromDate: any = moment.utc(mockres.leaves[0].from).local();
    expect(component.today.getTime() > fullFromDate._d.getTime()).toBeFalsy();
    expect(component.row).toEqual(mockresdata);
    expect(component.rows).toEqual(mockresdata);
    const mockerrorres = { message: 'xyz' };
    spyservice.and.returnValue(throwError(mockerrorres));
    component.getLeave();
  });

  it('onDateChange should be called', () => {
    const event = 'Thu Apr 01 2021 00:00:00 GMT+0530 (India Standard Time)';
    component.onDateChange(event);
  });

  it('onReset should be called', () => {
    spyOn(component, 'getLeave');
    spyOn(component.dateform, 'reset');
    component.onReset();
    expect(component.row).toEqual([]);
    expect(component.rows).toEqual([]);
    expect(component.getLeave).toHaveBeenCalled();
  });

  it('arrow should be called', () => {
    component.arrow();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['']);
  });

  it('onEditLeave should be called', () => {
    const leavedata = {
      active: false,
      fromdate: '2021-05-29T00:00:00.000Z',
      leave_id: '608252e910cec10012de04c0',
      reason: 'required',
      todate: '2021-05-14T00:00:00.000Z',
      type: 'Paternity Leave',
    };
    spyOn(component, 'getLeave');
    component.onEditLeave(leavedata);
    expect(component.dialog.open).toHaveBeenCalled();
    expect(component.dialog.open).toHaveBeenCalledWith(
      DeclareleaveDialogboxComponent,
      {
        width: '600px',
        height: '600px',
        autoFocus: false,
        disableClose: true,
        data: {
          leavedata,
        },
      }
    );
    const dialogRef = component.dialog.open(DeclareleaveDialogboxComponent, {
      width: '600px',
      height: '600px',
      autoFocus: false,
      disableClose: true,
      data: {
        leavedata,
      },
    });
    dialogRef.afterClosed().subscribe(() => {
      expect(component.row).toEqual([]);
      expect(component.rows).toEqual([]);
      expect(component.getLeave).toHaveBeenCalled();
    });
  });

  it('onCancelLeave should be called', () => {
    const mockleavedata = {
      active: false,
      fromdate: '2021-04-29T00:00:00.000Z',
      leave_id: '608252e910cec10012de04c0',
      reason: 'required',
      todate: '2021-05-14T00:00:00.000Z',
      type: 'Paternity Leave',
    };
    spyOn(component, 'getLeave');
    component.onCancelLeave(mockleavedata);
    expect(component.dialog.open).toHaveBeenCalled();
    expect(component.dialog.open).toHaveBeenCalledWith(PopupComponent, {
      width: '400px',
      height: '200px',
      disableClose: true,
      autoFocus: false,
      data: {
        leaveId: '608252e910cec10012de04c0',
        cancelLeave: 'cancelLeave',
      },
    });
    const dialogRef = component.dialog.open(PopupComponent, {
      width: '400px',
      height: '200px',
      disableClose: true,
      autoFocus: false,
      data: {
        leaveId: '608252e910cec10012de04c0',
        cancelLeave: 'cancelLeave',
      },
    });
    dialogRef.afterClosed().subscribe(() => {
      expect(component.row).toEqual([]);
      expect(component.rows).toEqual([]);
      expect(component.getLeave).toHaveBeenCalled();
    });
  });
});
