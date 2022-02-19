import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptorInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const user = JSON.parse(localStorage.getItem('userData'));
    if (user != null) {
      const modifiedReq = request.clone({
        setHeaders: { authorization: 'Bearer ' + user.token },
      });
      return next.handle(modifiedReq);
    }
    return next.handle(request);
  }
}
