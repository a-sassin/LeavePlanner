import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AppModule } from '../app.module';
import { SidenavModule } from '../sidenav/sidenav.module';

import { LoginAuthGuardService } from './login-auth-guard.service';

describe('LoginAuthGuardService', () => {
  let service: LoginAuthGuardService;
  const router = { navigate: jasmine.createSpy('navigate') };
  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          {
            path: 'dashboard',
            loadChildren: () =>
              import('../sidenav/sidenav.module').then((m) => m.SidenavModule),
          },
        ]),
        AppModule,
        SidenavModule,
      ],
      providers: [{ provide: Router, useValue: router }],
    });
    service = TestBed.inject(LoginAuthGuardService);
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
    expect(service).toBeTruthy();
  });

  it('canActivate should be called', () => {
    const res = {
      empID: 'GS-SE-011',
      manager: 'Lead Software Engineer1',
      name: 'Software Engineer011',
      practice: 'IDM',
      title: 'Software Engineer',
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXBOYW1lIjoiU29mdHdhcmUgRW5naW5lZXIwMTEiLCJlbXBQYXNzd29yZCI6IlJAbmQwbVBhc3N3MHJkIiwiaWF0IjoxNjE4OTI0NzE2LCJleHAiOjE2MTg5Mjc3MTZ9.aNrNqC1-Fxa29B5veHVkzllleaXBaAUwWc-z6OuLfxw',
    };
    service.canActivate(route, state);
    localStorage.setItem('userData', JSON.stringify(res));
    expect(JSON.parse(localStorage.getItem('userData'))).toEqual(res);
    const data = JSON.parse(localStorage.getItem('userData'));
    expect(!data).toEqual(false);
    expect(service.canActivate(route, state)).toBeFalsy();
  });
});
