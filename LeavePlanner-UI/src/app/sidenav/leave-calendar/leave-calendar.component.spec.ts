import { ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { LeaveCalendarComponent } from './leave-calendar.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SidenavModule } from '../sidenav.module';
import { TeamEmployeesService } from 'src/app/services/team-employees.service';
import { of, throwError } from 'rxjs';
import * as moment from 'moment';
import { PublicHolidayService } from 'src/app/services/public-holiday.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { ErrorPageComponent } from 'src/app/error-page/error-page.component';
import { MatDatepicker } from '@angular/material/datepicker';

describe('LeaveCalendarComponent', () => {
  let component: LeaveCalendarComponent;
  let fixture: ComponentFixture<LeaveCalendarComponent>;
  let location;
  let router;
  const year = moment().year();
  const teamMembers = {
    data: [
      {
        name: 'Madhavi Shinde',
        empId: 'GS-0770',
        leaves: [],
      },
      {
        name: 'Madhavi Shinde',
        empId: 'GS-0770',
        leaves: [],
      },
    ],
  };
  const teamMember = {
    data: [
      {
        name: 'Madhavi Shinde',
        empId: 'GS-0770',
        leaves: [],
      },
    ],
  };
  const companyHolidays = {
    holiday: {
      year: '2021',
      holidaysList: [
        {
          date: '01/01/2021',
          occasionName: 'New year’s Day',
        },
        {
          date: '01/26/2021',
          occasionName: 'Republic Day',
        },
      ],
    },
  };
  const monthDates = [
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    28,
    29,
    30,
  ];
  const sutAndSunDates = ['04', 11, 18, 25, '03', 10, 17, 24];
  const weekAndMonthDays = [
    { date: '01', day: 'Th' },
    { date: '02', day: 'F' },
    { date: '03', day: 'Sa' },
    { date: '04', day: 'S' },
    { date: '05', day: 'M' },
    { date: '06', day: 'T' },
    { date: '07', day: 'W' },
    { date: '08', day: 'Th' },
    { date: '09', day: 'F' },
    { date: 10, day: 'Sa' },
    { date: 11, day: 'S' },
    { date: 12, day: 'M' },
    { date: 13, day: 'T' },
    { date: 14, day: 'W' },
    { date: 15, day: 'Th' },
    { date: 16, day: 'F' },
    { date: 17, day: 'Sa' },
    { date: 18, day: 'S' },
    { date: 19, day: 'M' },
    { date: 20, day: 'T' },
    { date: 21, day: 'W' },
    { date: 22, day: 'Th' },
    { date: 23, day: 'F' },
    { date: 24, day: 'Sa' },
    { date: 25, day: 'S' },
    { date: 26, day: 'M' },
    { date: 27, day: 'T' },
    { date: 28, day: 'W' },
    { date: 29, day: 'Th' },
    { date: 30, day: 'F' },
  ];
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LeaveCalendarComponent, ErrorPageComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        BrowserAnimationsModule,
        SidenavModule,
        RouterTestingModule.withRoutes([
          { path: 'error-page', component: ErrorPageComponent },
        ]),
      ],
    }).compileComponents();
  });

  beforeEach(inject([Router, Location], (route: Router, loc: Location) => {
    location = loc;
    router = route;
    fixture = TestBed.createComponent(LeaveCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Should call all fun in ngOnInit', () => {
    spyOn(component, 'daysPerMonth');
    spyOn(component, 'allTeamMembers');
    spyOn(component, 'getHoliday');
    spyOn(component, 'allSatAndSundayDates');
    spyOn(component, 'weekDaysFun');
    component.ngOnInit();
    expect(component.daysPerMonth).toHaveBeenCalled();
    expect(component.allSatAndSundayDates).toHaveBeenCalled();
    expect(component.weekDaysFun).toHaveBeenCalled();
    expect(component.allTeamMembers).toHaveBeenCalled();
    expect(component.getHoliday).toHaveBeenCalled();
  });

  it('Should call allTeamMembers', () => {
    const teamService = fixture.debugElement.injector.get(TeamEmployeesService);
    const spy = spyOn(teamService, 'getleavesByMonth');
    spy.and.returnValue(of(teamMembers));
    component.allTeamMembers();
    expect(component.isLoading).toBeFalsy();
    expect(component.users).toEqual(teamMembers.data);
    expect(component.member).toBe('Members');
    spy.and.returnValue(of(teamMember));
    component.allTeamMembers();
    expect(component.users).toEqual(teamMember.data);
    expect(component.member).toBe('Member');
    spy.and.returnValue(throwError('error'));
    component.month = 11;
    component.allTeamMembers();
    router.navigate(['/error-page']).then(() => {
      expect(location.path()).toBe('/error-page');
    });
  });

  it('should call chosenYearHandler', () => {
    component.chosenYearHandler(moment());
    expect(component.year).toEqual(year);
  });

  // To do later
  xit('should call chosenMonthHandler', () => {
    const datepicker = {} as MatDatepicker<moment.Moment>;
    spyOn(component, 'daysPerMonth');
    spyOn(component, 'weekDaysFun');
    spyOn(component, 'getHoliday');
    spyOn(component, 'allTeamMembers');
    // spyOn(datepicker, 'close');
    component.chosenMonthHandler(moment(), datepicker);
    expect(component.daysPerMonth).toHaveBeenCalled();
    expect(component.weekDaysFun).toHaveBeenCalled();
    expect(component.getHoliday).toHaveBeenCalled();
    expect(component.allTeamMembers).toHaveBeenCalled();
    // expect(datepicker.close()).toHaveBeenCalled();
  });

  it('Should call getHoliday and return holidays', () => {
    const holidayService = fixture.debugElement.injector.get(
      PublicHolidayService
    );
    spyOn(holidayService, 'getPublicHolidays').and.returnValue(
      of(companyHolidays)
    );
    component.getHoliday();
    expect(!companyHolidays.holiday).toBeFalsy();
  });

  it('should call boxColor fun and return CSS class', () => {
    spyOn(component, 'currentMonth');
    spyOn(component, 'leaveIdAndType').and.returnValue('Paternity Leave');
    spyOn(component, 'colorName').and.returnValue('paternity');
    component.boxColor('06', 'GS-0770');
    component.users = [
      {
        name: 'Madhavi Shinde',
        empId: 'GS-0770',
        leaves: [
          {
            dates: ['2021-04-05', '2021-04-06'],
            leave_id: '608252e910cec10012de04c0',
            reason: 'requireds',
            type: 'Paternity Leave',
          },
        ],
      },
    ];
    const box = component.leaveIdAndType(0, 4, 6);
    expect(box).toEqual('Paternity Leave');
  });

  it('should call absentLeave and in return call allTeamMembers fun', () => {
    const teamService = fixture.debugElement.injector.get(TeamEmployeesService);
    const spy = spyOn(teamService, 'absentEmployee');
    spy.and.returnValue(of('Absent marked successfully'));
    spyOn(component, 'allTeamMembers');
    component.absentLeave('GS-0415', 'Pankaj Khamkar', '01');
    expect(component.isLoadingAbsent).toEqual(false);
    expect(component.allTeamMembers).toHaveBeenCalled();
    spy.and.returnValue(throwError('invalid params'));
    component.absentLeave('GS-0415', 'Pankaj Khamkar', '01');
    expect(component.isLoadingAbsent).toEqual(false);
  });

  it('should call deletLeave and in return call allTeamMembers fun', () => {
    const teamService = fixture.debugElement.injector.get(TeamEmployeesService);
    spyOn(teamService, 'unMarkAbsent').and.returnValue(
      of('Absent unmarked successfully')
    );
    spyOn(component, 'allTeamMembers');
    component.users = [
      {
        empId: 'GS-0000',
        name: 'Software Engineer011',
        leaves: [
          {
            dates: ['2021-04-08'],
            leave_id: '6082527e10cec10012de04bc',
            reason: 'required',
            type: 'Unplanned Leave',
          },
        ],
      },
    ];
    component.month = 4;
    component.deleteLeave('GS-0000', '08');

    expect(component.isLoadingAbsent).toEqual(false);
    expect(component.allTeamMembers).toHaveBeenCalled();
  });

  it('should call deletLeave and in return Error and call allTeamMembers fun', () => {
    const teamService = fixture.debugElement.injector.get(TeamEmployeesService);
    spyOn(teamService, 'unMarkAbsent').and.returnValue(throwError('Error'));
    spyOn(component, 'allTeamMembers');
    component.users = [
      {
        empId: 'GS-0000',
        name: 'Software Engineer011',
        leaves: [
          {
            dates: ['2021-04-08'],
            leave_id: '6082527e10cec10012de04bc',
            reason: 'required',
            type: 'Unplanned Leave',
          },
        ],
      },
    ];
    component.month = 4;
    component.deleteLeave('GS-0000', '08');

    expect(component.isLoadingAbsent).toEqual(false);
    expect(component.allTeamMembers).toHaveBeenCalled();
  });

  it('call daysPerMonth', () => {
    component.month = 5;
    component.daysPerMonth(30);
    expect(component.monthDates).toEqual(monthDates);
  });

  it('call allSatAndSundayDates and return sat & sun dates', () => {
    component.allSatAndSundayDates(4, 2021, 4, 30);
    expect(component.sundayDates).toEqual(sutAndSunDates);
  });

  it('call weekDayFun and return week days', () => {
    component.month = 4;
    component.weekDaysFun(4, 30);
    expect(component.weekAndMonthDays).toEqual(weekAndMonthDays);
    component.weekDaysFun(7, 30);
    expect(component.firstDay).toBe(1);
    component.weekDaysFun(6, 30);
    expect(component.firstDay).toBe(2);
    component.weekDaysFun(5, 30);
    expect(component.firstDay).toBe(3);
    component.weekDaysFun(4, 30);
    expect(component.firstDay).toBe(4);
    component.weekDaysFun(3, 30);
    expect(component.firstDay).toBe(5);
    component.weekDaysFun(2, 30);
    expect(component.firstDay).toBe(6);
    component.weekDaysFun(1, 30);
    expect(component.firstDay).toBe(0);
  });

  it('call getFirstWeekDay and return first sunday date in a month', () => {
    component.getFirstWeekDay('2021-4-1', 0);
    const date = moment('2021-4-1', 'YYYY-MM-DD');
    const day = date.day();
    let diffDays = 7 - (day - 0);
    diffDays = date.add(diffDays, 'day').date();
    expect(diffDays).toEqual(4);
  });

  it('call text and return 12 11 character ', () => {
    const name = component.text('Pathakamuri Siddartha');
    expect(name).toBe('Pathakamuri ...');
  });

  it('call dayName fun and return full name of a day', () => {
    component.dayName('S');
    expect(component.fullDayName).toEqual('Sunday');
    component.dayName('M');
    expect(component.fullDayName).toEqual('Monday');
    component.dayName('T');
    expect(component.fullDayName).toEqual('Tuesday');
    component.dayName('W');
    expect(component.fullDayName).toEqual('Wednesday');
    component.dayName('Th');
    expect(component.fullDayName).toEqual('Thursday');
    component.dayName('F');
    expect(component.fullDayName).toEqual('Friday');
    component.dayName('Sa');
    expect(component.fullDayName).toEqual('Saturday');
  });

  it('call arrow fun and navigate to home', () => {
    component.arrow();
    router.navigate(['']).then(() => {
      expect(location.path()).toBe('/');
    });
  });

  it('call boxColor fun and return css class name', () => {
    spyOn(component, 'allTeamMembers');
    component.users = [
      {
        empId: 'GS-0000',
        name: 'Software Engineer011',
        leaves: [
          {
            dates: ['2021-04-01'],
            leave_id: '6082527e10cec10012de04bc',
            reason: 'required',
            type: 'Paternity Leave',
          },
          {
            dates: ['2021-04-02'],
            leave_id: '6082527e10cec10012de04cb',
            reason: 'required',
            type: 'Privilege Leave',
          },
          {
            dates: ['2021-04-05'],
            leave_id: '6082527e10cec10012de04bd',
            reason: 'required',
            type: 'Unpaid Leave',
          },
          {
            dates: ['2021-04-06'],
            leave_id: '6082527e10cec10012de04ba',
            reason: 'required',
            type: 'Adoption Leave',
          },
          {
            dates: ['2021-04-07'],
            leave_id: '6082527e10cec10012de04bk',
            reason: 'required',
            type: 'Floating Holiday',
          },
          {
            dates: ['2021-04-08'],
            leave_id: '6082527e10cec10012de04bm',
            reason: 'required',
            type: 'Family and Emergency Leave',
          },
          {
            dates: ['2021-04-09'],
            leave_id: '6082527e10cec10012de04bt',
            reason: 'required',
            type: 'Unplanned Leave',
          },
          {
            dates: ['2021-04-12'],
            leave_id: '6082527e10cec10012de04bp',
            reason: 'required',
            type: 'Absent',
          },
        ],
      },
    ];
    component.holidays = [
      '01/26/2021',
      '02/26/2021',
      '03/26/2021',
      '04/26/2021',
      '05/26/2021',
      '06/26/2021',
      '07/26/2021',
      '08/26/2021',
      '09/26/2021',
      '10/26/2021',
      '11/26/2021',
      '12/26/2021',
    ];
    component.sundayDates = ['03', '04'];
    component.month = 4;
    component.year = 2021;
    component.boxColor('03', 'GS-0000');
    component.boxColor(26, 'GS-0000');
    component.boxColor('01', 'GS-0000');
    component.boxColor('02', 'GS-0000');
    component.boxColor('05', 'GS-0000');
    component.boxColor('06', 'GS-0000');
    component.boxColor('07', 'GS-0000');
    component.boxColor('08', 'GS-0000');
    component.boxColor('09', 'GS-0000');
    component.boxColor(12, 'GS-0000');
    expect(component.disableClick).toEqual(false);
    expect(component.isDeleteAbsent).toEqual(false);
    component.month = moment().month() + 1;
    component.year = moment().year();
    const date = moment().date() + 1;
    component.boxColor(date, 'GS-0000');
    expect(component.disableClick).toEqual(true);
    component.month = 4;
    component.year = 2021;
    component.boxColor(15, 'GS-0000');
    expect(component.disableClick).toEqual(false);
  });
});
