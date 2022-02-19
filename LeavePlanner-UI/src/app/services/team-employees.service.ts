import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TeamEmployeesService {
  baseUrl = environment.baseUrl;
  constructor(private readonly http: HttpClient) {}

  getEmployees(teamId: string): any {
    return this.http.get(`${this.baseUrl}/employees/getEmployees`, {
      params: {
        teamId,
      },
    });
  }
  getleavesByMonth(teamId: any, month: any, year: any): any {
    return this.http.get(`${this.baseUrl}/employees/getEmployees`, {
      params: {
        month,
        year,
        teamId,
      },
    });
  }
  absentEmployee(date: any, empId: string, empName: string, teamId: any): any {
    return this.http.post(`${this.baseUrl}/employees/markAbsent`, {
      date,
      empId,
      empName,
      teamId,
    });
  }
  unMarkAbsent(leaveId: string): any {
    return this.http.delete(`${this.baseUrl}/employees/unMarkAbsent`, {
      params: {
        leave_id: leaveId,
      },
    });
  }
}
