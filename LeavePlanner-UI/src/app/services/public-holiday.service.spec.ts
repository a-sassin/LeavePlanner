import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { PublicHolidayService } from './public-holiday.service';

describe('PublicHolidayService', () => {
  let service: PublicHolidayService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PublicHolidayService],
    });
    service = TestBed.inject(PublicHolidayService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('upload holiday file should be called', () => {
    service.uploadHoliday('').subscribe((resdata) => {
      expect(resdata).toEqual('');
    });
    const request = httpMock.expectOne(`${service.baseUrl}/admin/holidays`);
    expect(request.request.method).toBe('PUT');
  });

  it('public holiday should be called', () => {
    service.getPublicHolidays('2021').subscribe((resdata) => {
      expect(resdata).toEqual('');
    });
    const request = httpMock.expectOne(
      `${service.baseUrl}/admin/holidays?year=2021`
    );
    expect(request.request.method).toBe('GET');
  });

  afterEach(() => {
    httpMock.verify();
  });
});
