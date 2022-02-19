import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LeavesService {
  constructor(private readonly httpClient: HttpClient) {}
  baseUrl = environment.baseUrl;
  addLeave(
    fromDate: string,
    toDate: string,
    reason: string,
    type: string
  ): any {
    return this.httpClient.post(`${this.baseUrl}/leave-dashboard/leave`, {
      from: fromDate,
      to: toDate,
      reason,
      type,
    });
  }
  getLeave(): any {
    return this.httpClient.get(`${this.baseUrl}/leave-dashboard/leave`);
  }
  deleteLeave(leaveId: string): any {
    return this.httpClient.delete(`${this.baseUrl}/leave-dashboard/leave`, {
      params: {
        leave_id: leaveId,
      },
    });
  }
  updateleave(
    leaveId: string,
    from: string,
    to: string,
    reason: string,
    type: string
  ): any {
    return this.httpClient.patch(
      `${this.baseUrl}/leave-dashboard/leave`,
      {
        from,
        to,
        reason,
        type,
      },
      {
        params: {
          leave_id: leaveId,
        },
      }
    );
  }
}
