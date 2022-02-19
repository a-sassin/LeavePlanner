import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { AuthService } from '../services/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SharedModule } from '../shared/shared.module';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AppModule } from '../app.module';
import { of, throwError } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let testService: AuthService;
  const routerSpy = { navigate: jasmine.createSpy('navigate') };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        MatCheckboxModule,
        SharedModule,
        AppModule,
      ],
      providers: [AuthService, { provide: Router, useValue: routerSpy }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
    testService = TestBed.inject(AuthService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnint should be called', () => {
    spyOn(component, 'loginForm');
    component.ngOnInit();
    expect(component.loginForm).toHaveBeenCalled();
  });

  it('loginform should be called', () => {
    component.loginForm();
    expect(
      (component.loginform = new FormGroup({
        username: new FormControl(''),
        password: new FormControl(''),
        rememberme: new FormControl(''),
      }))
    ).toBeTruthy();
  });

  it('onSubmit should be called', () => {
    const res = {
      empID: 'GS-SE-011',
      manager: 'Lead Software Engineer1',
      name: 'Software Engineer011',
      practice: 'IDM',
      title: 'Software Engineer',
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXBOYW1lIjoiU29mdHdhcmUgRW5naW5lZXIwMTEiLCJlbXBQYXNzd29yZCI6IlJAbmQwbVBhc3N3MHJkIiwiaWF0IjoxNjE4OTI0NzE2LCJleHAiOjE2MTg5Mjc3MTZ9.aNrNqC1-Fxa29B5veHVkzllleaXBaAUwWc-z6OuLfxw',
    };
    component.loginform.controls.username.setValue('GS-SE-011');
    component.loginform.controls.password.setValue('R@nd0mPassw0rd');
    const spy = spyOn(testService, 'login');
    spy.and.returnValue(of(res));
    component.onSubmit();
    expect(component.loginform.valid).toBeFalsy();
    expect(component.onSubmit()).toBe(undefined);
    expect(component.loginform.controls.rememberme).toBeTruthy();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
    component.loginform.controls.username.setValue('GS-SE-01');
    component.loginform.controls.password.setValue('R@nd0mPassw0rd');
    spy.and.returnValue(
      throwError({
        error: {
          message: 'AD authentication failed',
          status: 401,
        },
      })
    );
    component.onSubmit();
    expect(component.errormessage).toEqual('AD authentication failed');
  });
});
