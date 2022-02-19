import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PublicHolidayService {
  constructor(private readonly httpClient: HttpClient) {}
  baseUrl = environment.baseUrl;

  getPublicHolidays(year: any): any {
    return this.httpClient.get(`${this.baseUrl}/admin/holidays`, {
      params: {
        year,
      },
    });
  }
  uploadHoliday(formData): any {
    return this.httpClient.put(`${this.baseUrl}/admin/holidays`, formData);
  }
}
