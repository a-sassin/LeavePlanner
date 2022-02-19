import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { LeavesService } from './leaves.service';

describe('LeavesService', () => {
  let service: LeavesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LeavesService],
    });
    service = TestBed.inject(LeavesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('addLeave api should be called', () => {
    const mockres = {
      status: 200,
      leaves: [
        {
          from: '2021-04-01T00:00:00.000Z',
          to: '2021-04-01T00:00:00.000Z',
          reason: 'required',
          type: 'Unplanned Leave',
          empId: 'GS-SE-011',
          leave_id: '6077ea8c7b6b170012b76286',
        },
        {
          from: '2021-04-09T00:00:00.000Z',
          to: '2021-04-09T00:00:00.000Z',
          reason: 'zd',
          type: 'Unplanned Leave',
          empId: 'GS-SE-011',
          leave_id: '60783ee79803cd00123bebed',
        },
      ],
      teams: [
        {
          name: 'Techsar-Innovative-Ideas-2021',
        },
        {
          name: 'IDM-1',
        },
      ],
      message: '',
    };
    service
      .addLeave('05/03/2021', '05/03/2021', 'Unpaid Leave', 'R@nd0mPassw0rd')
      .subscribe((resdata) => {
        expect(resdata).toEqual(mockres);
      });
    const request = httpMock.expectOne(
      `${service.baseUrl}/leave-dashboard/leave`
    );
    expect(request.request.method).toBe('POST');
  });

  it('get api should be called', () => {
    const mockres = {
      status: 200,
      leaves: [
        {
          from: '2021-04-01T00:00:00.000Z',
          to: '2021-04-01T00:00:00.000Z',
          reason: 'required',
          type: 'Unplanned Leave',
          empId: 'GS-SE-011',
          leave_id: '6077ea8c7b6b170012b76286',
        },
        {
          from: '2021-04-09T00:00:00.000Z',
          to: '2021-04-09T00:00:00.000Z',
          reason: 'zd',
          type: 'Unplanned Leave',
          empId: 'GS-SE-011',
          leave_id: '60783ee79803cd00123bebed',
        },
      ],
      teams: [
        {
          name: 'Techsar-Innovative-Ideas-2021',
        },
        {
          name: 'IDM-1',
        },
      ],
      message: '',
    };
    service.getLeave().subscribe((resdata) => {
      expect(resdata).toEqual(mockres);
    });
    const request = httpMock.expectOne(
      `${service.baseUrl}/leave-dashboard/leave`
    );
    expect(request.request.method).toBe('GET');
  });

  it('delete leave should be called', () => {
    const mockres = {
      message: 'Leave delete successfully',
    };
    service.deleteLeave('12345567890').subscribe((resdata) => {
      expect(resdata).toEqual(mockres);
    });
    const request = httpMock.expectOne(
      `${service.baseUrl}/leave-dashboard/leave?leave_id=12345567890`
    );
    expect(request.request.method).toBe('DELETE');
  });
  it('edit leave should be called', () => {
    const mockres = {
      message: 'Leave updated successfully',
      status: 200,
    };
    service
      .updateleave(
        '12345567890',
        '05/03/2021',
        '05/03/2021',
        'Unpaid Leave',
        'R@nd0mPassw0rd'
      )
      .subscribe((resdata) => {
        expect(resdata).toEqual(mockres);
      });
    const request = httpMock.expectOne(
      `${service.baseUrl}/leave-dashboard/leave?leave_id=12345567890`
    );
    expect(request.request.method).toBe('PATCH');
  });

  afterEach(() => {
    httpMock.verify();
  });
});
