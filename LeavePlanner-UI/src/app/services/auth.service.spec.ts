import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('login should be called', () => {
    const mockres = {
      empID: 'GS-SE-011',
      manager: 'Lead Software Engineer1',
      name: 'Software Engineer011',
      practice: 'IDM',
      title: 'Software Engineer',
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXBOYW1lIjoiU29mdHdhcmUgRW5naW5lZXIwMTEiLCJlbXBQYXNzd29yZCI6IlJAbmQwbVBhc3N3MHJkIiwiaWF0IjoxNjE4OTI0NzE2LCJleHAiOjE2MTg5Mjc3MTZ9.aNrNqC1-Fxa29B5veHVkzllleaXBaAUwWc-z6OuLfxw',
    };
    service.login('GS-SE-011', 'R@nd0mPassw0rd', true).subscribe((resdata) => {
      expect(resdata).toEqual(mockres);
    });
    const request = httpMock.expectOne(`${service.baseUrl}/employees/login`);
    expect(request.request.method).toBe('POST');
    request.flush(mockres);
  });

  it('logout should be called', () => {
    const mockres: any = {
      message: 'LoggedOut successfully!',
    };
    service.logout().subscribe((resdata) => {
      expect(resdata).toEqual(mockres);
    });
    const request = httpMock.expectOne(`${service.baseUrl}/employees/logout`);
    expect(request.request.method).toBe('POST');
  });

  afterEach(() => {
    httpMock.verify();
  });
});
