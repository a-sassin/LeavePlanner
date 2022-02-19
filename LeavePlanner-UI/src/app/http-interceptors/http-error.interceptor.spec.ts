import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { throwError } from 'rxjs';
import { SharedModule } from '../shared/shared.module';

import { HttpErrorInterceptor } from './http-error.interceptor';

describe('HttpErrorInterceptor', () => {
  let httpRequestSpy;
  let httpHandlerSpy;
  const routerSpy = { navigate: jasmine.createSpy('navigate') };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HttpErrorInterceptor,
        { provide: Router, useValue: routerSpy },
      ],
      imports: [SharedModule, RouterTestingModule, HttpClientTestingModule],
    });
  });
  beforeEach(() => {
    const store = {};
    const mockLocalStorage = {
      getItem: (key: string): string => {
        return key in store ? store[key] : null;
      },
      setItem: (key: string, value: string) => {
        store[key] = `${value}`;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
    };
    spyOn(localStorage, 'getItem').and.callFake(mockLocalStorage.getItem);
    spyOn(localStorage, 'setItem').and.callFake(mockLocalStorage.setItem);
    spyOn(localStorage, 'removeItem').and.callFake(mockLocalStorage.removeItem);
  });

  it('should be created', () => {
    const interceptor: HttpErrorInterceptor = TestBed.inject(
      HttpErrorInterceptor
    );
    expect(interceptor).toBeTruthy();
  });

  it('intercept method', () => {
    const errorResponse = new HttpErrorResponse({
      error: { status: 500, message: 'error' },
      headers: new HttpHeaders(),
      status: 500,
      statusText: 'Not Found',
      url: null,
    });
    const interceptor: HttpErrorInterceptor = TestBed.inject(
      HttpErrorInterceptor
    );
    httpRequestSpy = jasmine.createSpyObj('HttpRequest', ['doesNotMatter']);
    httpHandlerSpy = jasmine.createSpyObj('HttpHandler', ['handle']);

    httpHandlerSpy.handle.and.returnValue(throwError(errorResponse));
    localStorage.setItem('userData', JSON.stringify(''));
    let user = JSON.parse(localStorage.getItem('userData'));

    interceptor.intercept(httpRequestSpy, httpHandlerSpy).subscribe(
      (result) => console.log('good', result),
      (err) => {
        expect(user).toBeFalsy();
        expect(err).toEqual(errorResponse);
      }
    );
    localStorage.setItem('userData', JSON.stringify('mockdata'));
    user = JSON.parse(localStorage.getItem('userData'));
    interceptor.intercept(httpRequestSpy, httpHandlerSpy).subscribe(
      (result) => console.log('good', result),
      (err: HttpErrorResponse) => {
        console.log('error', err);
        expect(user).toBeTruthy();
        expect(err).toEqual(errorResponse);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
      }
    );
  });
});
