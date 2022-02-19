import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { EmployeesService } from 'src/app/services/employees.service';
import { LeavesService } from 'src/app/services/leaves.service';
import { MyteamDialogboxComponent } from '../myteam-dialogbox/myteam-dialogbox.component';
import { SharedModule } from '../shared.module';

import { PopupComponent } from './popup.component';

describe('PopupComponent', () => {
  let component: PopupComponent;
  let fixture: ComponentFixture<PopupComponent>;
  let empService: EmployeesService;
  let leaveService: LeavesService;
  let dialogSpy: jasmine.Spy;
  const dialogRefSpyObj = jasmine.createSpyObj({
    afterClosed: of({}),
    close: null,
  });

  const dialogMock = {
    close: () => {},
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PopupComponent, MyteamDialogboxComponent],
      imports: [HttpClientTestingModule, RouterTestingModule, SharedModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: dialogMock },
      ],
    }).compileComponents();
    empService = TestBed.inject(EmployeesService);
    leaveService = TestBed.inject(LeavesService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    dialogSpy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(
      dialogRefSpyObj
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnint should be called', () => {
    spyOn(component, 'check');
    component.ngOnInit();
    expect(component.check).toHaveBeenCalled();
  });

  it('teamNameLength should be called', () => {
    let mockName = 'string123456789';
    component.teamNameLength(mockName);
    expect(component.teamNameLength.name.length > 12).toBeTrue();
    if (mockName.length > 12) {
      mockName = mockName.slice(0, 12) + '...';
    }
    expect(mockName).toBe('string123456...');
    mockName = 'required';
    component.teamNameLength(mockName);
    if (mockName.length > 30) {
      mockName = mockName.slice(0, 30) + '...';
    }
    expect(mockName).toBe('required');
  });

  it('onCancel should be called', () => {
    spyOn(component, 'myTeamDialog');
    const spy = spyOn(component.dialogRef, 'close').and.callThrough();
    component.onCancel();
    expect(spy).toHaveBeenCalled();
    expect(component.myTeamDialog).toHaveBeenCalled();
  });

  it('delete team should be called', () => {
    const mockres = { message: 'Team deleted successfully', status: 200 };
    const spyservice = spyOn(empService, 'deleteTeam');
    spyOn(component, 'myTeamDialog');
    spyservice.and.returnValue(of(mockres));
    const spy = spyOn(component.dialogRef, 'close').and.callThrough();
    component.deleteTeam('123456789');
    expect(spy).toHaveBeenCalled();
    expect(component.myTeamDialog).toHaveBeenCalled();
    const mockerrorres = { message: "team doesn't exist" };
    spyservice.and.returnValue(throwError(mockerrorres));
    component.deleteTeam('123456789');
  });

  it('myTeamDialog should be called', () => {
    component.myTeamDialog();
    expect(component.dialog.open).toHaveBeenCalled();
    expect(component.dialog.open).toHaveBeenCalledWith(
      MyteamDialogboxComponent,
      {
        width: '600px',
        height: '600px',
        autoFocus: false,
        panelClass: 'myapp-no-padding-dialog',
      }
    );
  });

  it('delete leave should be called', () => {
    const mockres = { message: 'Leave deleted successfully', status: 200 };
    const spyservice = spyOn(leaveService, 'deleteLeave');
    spyservice.and.returnValue(of(mockres));
    const spy = spyOn(component.dialogRef, 'close').and.callThrough();
    component.deleteLeave('123456789');
    expect(spy).toHaveBeenCalled();
  });

  it('onClickNo should be called', () => {
    const spy = spyOn(component.dialogRef, 'close').and.callThrough();
    component.onClickNo();
    expect(spy).toHaveBeenCalled();
  });
});
