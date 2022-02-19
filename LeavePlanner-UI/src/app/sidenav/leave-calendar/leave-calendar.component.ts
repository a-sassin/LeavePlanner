import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { PublicHolidayService } from 'src/app/services/public-holiday.service';
import { TeamEmployeesService } from 'src/app/services/team-employees.service';

export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
@Component({
  selector: 'app-leave-calendar',
  templateUrl: './leave-calendar.component.html',
  styleUrls: ['./leave-calendar.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class LeaveCalendarComponent implements OnInit {
  teamId: any;
  nameSearch: any = '';
  teamName: string;
  isLoading = false;
  isLoadingAbsent = false;
  isDeleteAbsent = true;
  disableClick = true;
  leaveId: any;
  days = 0;
  newDate: string;
  monthDates: any = [];
  sundayDates: any = [];
  users: any = [];
  holidays: any = [];
  year: number;
  month: number;
  defaultWeekDays: any = ['S', 'M', 'T', 'W', 'Th', 'F', 'Sa'];
  weekDays: any = [];
  weekAndMonthDays: any = [];
  usersLength: number;
  member = 'Members';
  fullDayName: string;
  firstSunday: number;
  firstDay: number;
  date = new FormControl(moment());

  constructor(
    private readonly teamService: TeamEmployeesService,
    private readonly holidayService: PublicHolidayService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): any {
    // All Saturday & Sunday dates
    const currentMonth = moment().month() + 1;
    this.month = currentMonth;
    const currentYear = moment().year();
    this.days = moment(currentMonth, 'M').daysInMonth();
    this.daysPerMonth(this.days);
    const monthLength = this.monthDates.length;
    // first Sunday date in a month
    const sunday = this.getFirstWeekDay(`${currentYear}-${this.month}-${1}`, 0);

    this.allSatAndSundayDates(sunday, currentYear, currentMonth, monthLength);

    // Week days call
    this.weekDaysFun(sunday, monthLength);

    setTimeout(() => {
      // Fetch team members
      this.allTeamMembers();
      // get public holidays
      this.getHoliday();
    }, 0);
  }

  chosenYearHandler(normalizedYear: moment.Moment): any {
    this.date.setValue(normalizedYear);
    this.year = normalizedYear.year();
  }

  chosenMonthHandler(
    normalizedMonth: moment.Moment,
    datepicker: MatDatepicker<moment.Moment>
  ): any {
    this.date.setValue(normalizedMonth);
    this.days = moment(normalizedMonth.month() + 1, 'M').daysInMonth();
    // No.of days per month
    this.daysPerMonth(this.days);
    // All Saturday & Sunday dates fun call
    const monthLength = this.monthDates.length;
    this.month = normalizedMonth.month() + 1;
    // Sunday date
    const sunday = this.getFirstWeekDay(`${this.year}-${this.month}-${1}`, 0);
    this.allSatAndSundayDates(sunday, this.year, this.month, monthLength);

    // WeekDays fun call
    this.weekDaysFun(sunday, monthLength);
    // get public holidays
    this.getHoliday();

    this.allTeamMembers();

    datepicker.close();
  }

  changeMonth(action: string): void {
    const selectedDate = this.date.value;
    let month = moment(selectedDate).month();
    let year = moment(selectedDate).year();
    if (action === 'next') {
      month += 1;
      if (month > 11) {
        month = 0;
        year += 1;
      }
    } else {
      month -= 1;
      if (month < 0) {
        month = 11;
        year -= 1;
      }
    }
    this.year = year;
    this.month = month + 1;
    const ctrlValue = this.date.value;
    ctrlValue.month(month);
    ctrlValue.year(year);
    this.date.setValue(moment(ctrlValue));
    this.days = moment(this.month, 'M').daysInMonth();
    // No.of days per month
    this.daysPerMonth(this.days);
    // All Saturday & Sunday dates fun call
    const monthLength = this.monthDates.length;
    const sunday = this.getFirstWeekDay(`${this.year}-${this.month}-${1}`, 0);
    this.allSatAndSundayDates(sunday, this.year, this.month, monthLength);

    // WeekDays fun call
    this.weekDaysFun(sunday, monthLength);
    // get public holidays
    this.getHoliday();

    this.allTeamMembers();
  }

  // Get public holidays
  getHoliday(): any {
    this.holidays = [];
    this.holidayService.getPublicHolidays(this.year).subscribe((res) => {
      if (res.holiday) {
        for (const holidayDates of res.holiday.holidaysList) {
          this.holidays.push(holidayDates.date);
        }
      }
    });
  }

  // Leaves color
  boxColor(boxDate: any, empId: string): any {
    let color;
    let box;
    const month = this.currentMonth();
    this.disableClick = true;
    this.isDeleteAbsent = true;
    const empIndex = this.users.findIndex((elem) => empId === elem.empId);

    ({ box } = this.leaveIdAndType(empIndex, month, boxDate));

    const holidayBox = this.holidays.includes(
      `${month}/${boxDate}/${this.year}`
    );
    ({ color } = this.colorName(holidayBox, box, boxDate, month));
    return color;
  }

  leaveIdAndType(empIndex: any, month: any, boxDate: any): any {
    let leaveBox;
    let leaveId;
    let box;
    this.users[empIndex].leaves.forEach((leaveDateIndex) => {
      leaveBox = leaveDateIndex.dates.includes(
        `${this.year}-${month}-${boxDate}`
      );
      if (leaveBox) {
        box = leaveDateIndex.type;
        leaveId = leaveDateIndex.leave_id;
      }
    });
    return { box, leaveId };
  }

  colorName(holidayBox: any, box: any, boxDate: any, month: any): any {
    let color;
    if (holidayBox) {
      box = 'Holiday';
    }
    if (this.sundayDates.includes(boxDate)) {
      color = 'weekend';
    } else if (box === 'Holiday') {
      color = 'holiday';
    } else if (box === 'Paternity Leave') {
      color = 'paternity';
    } else if (box === 'Privilege Leave') {
      color = 'privilege';
    } else if (box === 'Unpaid Leave') {
      color = 'unpaid';
    } else if (box === 'Adoption Leave') {
      color = 'adoption';
    } else if (box === 'Floating Holiday') {
      color = 'floating';
    } else if (box === 'Family and Emergency Leave') {
      color = 'family';
    } else if (box === 'Unplanned Leave') {
      color = 'unplanned';
    } else if (box === 'Absent') {
      color = 'absent';
      this.disableClick = false;
      this.isDeleteAbsent = false;
    } else {
      color = 'work';
      const date = `${this.year}-${month}-${boxDate}`;
      if (date > moment(Date.now()).format('YYYY-MM-DD')) {
        this.disableClick = true;
      } else {
        this.disableClick = false;
      }
    }
    return { color };
  }

  // Absent employee
  absentLeave(empId: string, empName: string, date: any): any {
    this.isLoadingAbsent = true;
    const absentDate = moment()
      .year(this.year)
      .month(this.month - 1)
      .date(date)
      .format('MM-DD-YYYY');
    this.teamService
      .absentEmployee(absentDate, empId, empName, this.teamId)
      .subscribe(
        (res) => {
          this.deleteAndAbsentLeaveSuccess(res);
        },
        (error) => {
          this.deleteAndAbsentLeaveError();
        }
      );
  }

  // Unmark absent
  deleteLeave(empId, boxDate): any {
    let leaveId;
    const month = this.currentMonth();
    this.disableClick = true;
    this.isLoadingAbsent = true;
    const empIndex = this.users.findIndex((elem) => empId === elem.empId);

    ({ leaveId } = this.leaveIdAndType(empIndex, month, boxDate));

    this.teamService.unMarkAbsent(leaveId).subscribe(
      (res) => {
        this.deleteAndAbsentLeaveSuccess(res);
      },
      (error) => {
        this.deleteAndAbsentLeaveError();
      }
    );
  }

  deleteAndAbsentLeaveSuccess(res: any): any {
    this.isLoadingAbsent = false;
    this.snackBar.open(res.message, 'Ok', {
      duration: 2000,
    });
    this.allTeamMembers();
  }

  deleteAndAbsentLeaveError(): any {
    this.isLoadingAbsent = false;
    this.allTeamMembers();
  }

  currentMonth(): any {
    let month: any = this.month;
    if (this.month < 10) {
      month = '0' + this.month;
    }
    return month;
  }

  // No.of days per month
  daysPerMonth(days: number): any {
    this.monthDates = [];
    for (let firstDate = 1; firstDate <= days; firstDate++) {
      if (firstDate < 10) {
        this.monthDates.push('0' + firstDate);
      } else {
        this.monthDates.push(firstDate);
      }
    }
  }

  allTeamMembers(): any {
    this.users = [];
    this.route.queryParams.subscribe((params) => {
      this.teamName = params.team;
      this.teamId = params.teamId;
      this.isLoading = true;
      let month;
      if (this.month < 10) {
        month = '0' + this.month;
      } else {
        month = this.month;
      }
      this.teamService
        .getleavesByMonth(this.teamId, month, this.year)
        .subscribe(
          (resData: any) => {
            this.users = resData.data;
            this.usersLength = this.users.length;
            this.isLoading = false;
            if (this.usersLength < 2) {
              this.member = 'Member';
            } else {
              this.member = 'Members';
            }
          },
          (err) => {
            this.router.navigate(['error-page']);
          }
        );
    });
  }

  // All Saturday & Sunday dates fun
  allSatAndSundayDates(sunday, year, month, monthLength): any {
    this.year = year;
    this.month = month;
    this.sundayDates = [];
    for (
      let lastSunday = sunday;
      lastSunday <= monthLength;
      lastSunday = lastSunday + 7
    ) {
      if (lastSunday < 10) {
        this.sundayDates.push('0' + lastSunday);
      } else {
        this.sundayDates.push(lastSunday);
      }
    }
    const saturday = sunday - 1;
    for (let lastSat = saturday; lastSat <= monthLength; lastSat += 7) {
      if (lastSat < 10) {
        this.sundayDates.push('0' + lastSat);
      } else {
        this.sundayDates.push(lastSat);
      }
    }
  }

  // Week Days of a month
  weekDaysFun(sunday: number, monthLength: number): any {
    this.weekAndMonthDays = [];
    this.weekDays = [];
    for (let weekSun = sunday; weekSun > 0; weekSun = weekSun - 7) {
      this.firstSunday = weekSun;
    }
    if (this.firstSunday === 7) {
      this.firstDay = 1;
    } else if (this.firstSunday === 6) {
      this.firstDay = 2;
    } else if (this.firstSunday === 5) {
      this.firstDay = 3;
    } else if (this.firstSunday === 4) {
      this.firstDay = 4;
    } else if (this.firstSunday === 3) {
      this.firstDay = 5;
    } else if (this.firstSunday === 2) {
      this.firstDay = 6;
    } else {
      this.firstDay = 0;
    }
    let day = this.firstDay;
    for (let weeklyDays = 1; weeklyDays <= monthLength; weeklyDays++) {
      if (day >= 7) {
        day = 0;
      }
      this.weekDays.push(this.defaultWeekDays[day]);
      day++;
    }
    for (let weekAndMonth = 0; weekAndMonth < monthLength; weekAndMonth++) {
      this.weekAndMonthDays.push({
        date: this.monthDates[weekAndMonth],
        day: this.weekDays[weekAndMonth],
      });
    }
  }

  // First Sunday in a month
  getFirstWeekDay(dateString, dayOfWeek): any {
    const date = moment(dateString, 'YYYY-MM-DD');
    const day = date.day();
    const diffDays = 7 - (day - dayOfWeek);
    return date.add(diffDays, 'day').date();
  }

  text(name: string): string {
    if (name.length > 12) {
      name = name.slice(0, 12) + '...';
    }
    return name;
  }

  dayName(day: string): string {
    this.fullDayName = '';
    if (day === 'S') {
      this.fullDayName = 'Sunday';
    } else if (day === 'M') {
      this.fullDayName = 'Monday';
    } else if (day === 'T') {
      this.fullDayName = 'Tuesday';
    } else if (day === 'W') {
      this.fullDayName = 'Wednesday';
    } else if (day === 'Th') {
      this.fullDayName = 'Thursday';
    } else if (day === 'F') {
      this.fullDayName = 'Friday';
    } else if (day === 'Sa') {
      this.fullDayName = 'Saturday';
    }
    return this.fullDayName;
  }

  arrow(): any {
    this.router.navigate(['']);
  }
}
