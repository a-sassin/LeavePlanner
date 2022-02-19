import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { tap } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private readonly httpClient: HttpClient) {}
  isLogIn = new BehaviorSubject<boolean>(true);
  public isLoading = new BehaviorSubject(false);
  baseUrl = environment.baseUrl;
  login(
    username: string,
    password: string,
    rememberme: boolean
  ): Observable<any> {
    return this.httpClient
      .post(`${this.baseUrl}/employees/login`, {
        username,
        password,
        rememberme,
      })
      .pipe(
        tap((resData) => {
          localStorage.setItem('userData', JSON.stringify(resData));
        })
      );
  }

  logout(): any {
    return this.httpClient.post(`${this.baseUrl}/employees/logout`, {});
  }

  /*
  alllogout(): any {
    return this.httpClient.post(`${this.baseUrl}/employees/logoutall`, {});
  }
  */
}
