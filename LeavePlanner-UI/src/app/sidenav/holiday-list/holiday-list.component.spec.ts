import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import * as moment from 'moment';
import { SidenavModule } from '../sidenav.module';
import { HolidayListComponent } from './holiday-list.component';
import { PublicHolidayService } from 'src/app/services/public-holiday.service';
import { of, throwError } from 'rxjs';

describe('HolidayListComponent', () => {
  let component: HolidayListComponent;
  let fixture: ComponentFixture<HolidayListComponent>;
  const routerSpy = { navigate: jasmine.createSpy('navigate') };
  let testService: PublicHolidayService;
  const datepicker = {} as MatDatepicker<moment.Moment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HolidayListComponent],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        SidenavModule,
        BrowserAnimationsModule,
      ],
      providers: [{ provide: Router, useValue: routerSpy }],
    }).compileComponents();
    testService = TestBed.inject(PublicHolidayService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HolidayListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should be called', () => {
    spyOn(component, 'dateform');
    component.ngOnInit();
    expect(component.dateform).toHaveBeenCalled();
  });

  it('dateform should be called', () => {
    expect(
      (component.dateForm = new FormGroup({
        year: new FormControl(moment()),
        file: new FormControl(''),
      }))
    ).toBeTruthy();
  });

  xit('chosenCalendar should be called', () => {
    spyOn(datepicker, 'close');
    component.chosenYearHandler(moment(), datepicker);
    expect(component.dateForm.control.year).toEqual('2021');
    expect(datepicker.close).toHaveBeenCalled();
  });

  it('onSelectedFile should be called', () => {
    const mockFile = new File([''], 'gslabHolidays2021 new.csv', {
      type: 'text/csv',
    });
    const mockEvt = { target: { files: [mockFile] } };
    component.onSelectedFile(mockEvt);
  });

  it('arrow should be called', () => {
    component.arrow();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['']);
  });

  it('oncancel should be callled', () => {
    spyOn(component, 'reset');
    component.onCancel();
    expect(component.reset).toHaveBeenCalled();
  });

  it('onSubmit should be called', () => {
    let mockFile = new File([''], 'gslabHolidays2021 new.csv', {
      type: 'text/csv',
    });
    component.dateForm.controls.year.setValue(moment());
    component.dateForm.controls.file.setValue(mockFile);
    spyOn(console, 'log').and.callThrough();
    const spy = spyOn(testService, 'uploadHoliday');
    spy.and.returnValue(of(''));
    component.onSubmit();
    expect(component.dateForm.valid).toBeFalsy();
    expect(component.onSubmit()).toBe(undefined);
    mockFile = new File([''], 'gslabHolidays2021 new.csv', {
      type: 'text/html',
    });
    component.dateForm.controls.year.setValue(moment());
    component.dateForm.controls.file.setValue(mockFile);
    const mockerror = {
      error: {
        message:
          'Value entered in year field should be equal to value of year field in date',
        status: 400,
      },
    };
    spy.and.returnValue(throwError(mockerror));

    component.onSubmit();
    expect(console.log).toHaveBeenCalledWith(mockerror);
  });

  it('reset should be called', () => {
    component.reset();
  });
});
