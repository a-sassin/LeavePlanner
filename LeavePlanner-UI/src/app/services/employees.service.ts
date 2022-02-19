import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root',
})
export class EmployeesService {
  constructor(private readonly httpClient: HttpClient) {}
  baseUrl = environment.baseUrl;
  teamname = new Subject<any>();
  userLocalStorage = new Subject<any>();

  getEmployees(employee: any): any {
    return this.httpClient.get(`${this.baseUrl}/employees/listEmployees`, {
      params: {
        search: employee,
      },
    });
  }
  createTeam(name: string, members: any): any {
    return this.httpClient.post(`${this.baseUrl}/team/create`, {
      name,
      members,
    });
  }
  getTeam(): any {
    return this.httpClient.get(`${this.baseUrl}/team/list`);
  }

  deleteTeam(teamId): any {
    return this.httpClient.delete(`${this.baseUrl}/team/${teamId}`);
  }
  updateTeam(
    teamId: string,
    teamName: string,
    membersToAdd: any,
    membersToDelete: any
  ): any {
    return this.httpClient.patch(
      `${this.baseUrl}/team/updateteam`,
      {
        teamName,
        membersToAdd,
        membersToDelete,
      },
      {
        params: {
          teamId,
        },
      }
    );
  }
  reqTransferOwnership(teamId: string, newOwnerId: string): any {
    return this.httpClient.put(
      `${this.baseUrl}/team/requestOwnership`,
      {
        newOwnerId,
      },
      {
        params: {
          teamId,
        },
      }
    );
  }

  resTransferRequest(decision: string, teamId: string): any {
    return this.httpClient.patch(`${this.baseUrl}/team/transferOwnership`, {
      decision,
      teamId,
    });
  }
}
