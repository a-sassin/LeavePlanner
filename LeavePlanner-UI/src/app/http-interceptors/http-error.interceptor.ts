import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorService } from '../service/http-error.service';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatDialog } from '@angular/material/dialog';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(
    private readonly httpErorrService: HttpErrorService,
    private readonly router: Router,
    private readonly authservice: AuthService,
    public dialogRef: MatDialog
  ) {}
  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const user = JSON.parse(localStorage.getItem('userData'));
    if (!user) {
      return next.handle(request);
    }
    return next.handle(request).pipe(
      catchError((err) => {
        if (err instanceof HttpErrorResponse) {
          if (err.error.status === 500) {
            localStorage.removeItem('userData');
            this.dialogRef.closeAll();
            this.authservice.isLogIn.next(true);
            this.router.navigate(['/login']);
          } else {
            this.httpErorrService.showError(err.error.message);
          }
        }

        return throwError(err);
      })
    );
  }
}
