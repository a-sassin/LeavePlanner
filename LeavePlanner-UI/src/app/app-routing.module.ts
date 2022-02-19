import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ErrorPageComponent } from './error-page/error-page.component';
import { LoginComponent } from './login/login.component';
import { LoginAuthGuardService } from './auth-guards/login-auth-guard.service';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [LoginAuthGuardService],
    component: LoginComponent,
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./sidenav/sidenav.module').then((m) => m.SidenavModule),
  },
  { path: '**', component: ErrorPageComponent },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
