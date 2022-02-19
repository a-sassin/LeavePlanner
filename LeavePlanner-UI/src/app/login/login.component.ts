import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  Validators,
} from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { EncryptionService } from '../services/encryption.service';
import { ErrorStateMatcher } from '@angular/material/core';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  matcher = new MyErrorStateMatcher();
  constructor(
    private readonly authservice: AuthService,
    private readonly router: Router,
    private readonly encryption: EncryptionService
  ) {}

  hide = true;
  loginform: any;
  errormessage = '';
  nonWhitespaceRegExp: RegExp = new RegExp('\\S');

  ngOnInit(): void {
    this.loginForm();
  }

  loginForm(): any {
    this.loginform = new FormGroup({
      username: new FormControl('', [
        Validators.required,
        Validators.pattern(this.nonWhitespaceRegExp),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.pattern(this.nonWhitespaceRegExp),
      ]),
      rememberme: new FormControl(''),
    });
  }

  onSubmit(): any {
    if (!this.loginform.valid) {
      return;
    }
    const username = this.loginform.value.username;
    const pass = this.loginform.value.password;
    let rememberme = this.loginform.value.rememberme;
    const password = this.encryption.encryptPassword(pass);

    if (!rememberme) {
      rememberme = false;
    }

    this.authservice.login(username, password, rememberme).subscribe(
      (resdata) => {
        this.authservice.isLogIn.next(false);
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        this.errormessage = error.error.message;
      }
    );
    this.loginform.reset();
  }
}
