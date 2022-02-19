import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '../auth-guards/auth-guard.service';
import { LeaveCalendarComponent } from './leave-calendar/leave-calendar.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { ManageLeaveComponent } from './manage-leave/manage-leave.component';
import { TeamComponent } from './team/team.component';
import { HolidayListComponent } from './holiday-list/holiday-list.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'leave-calender',
    component: LeaveCalendarComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'home',
    component: LandingPageComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'manage-leaves',
    component: ManageLeaveComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'create-team',
    component: TeamComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'update-team',
    component: TeamComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'transferOwnership',
    component: TeamComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'holiday',
    component: HolidayListComponent,
    canActivate: [AuthGuardService],
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SidenavRoutingModule {}
