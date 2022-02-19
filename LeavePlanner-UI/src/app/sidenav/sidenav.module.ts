import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material/material.module';
import { SidenavRoutingModule } from './sidenav-routing.module';
import { LeaveCalendarComponent } from './leave-calendar/leave-calendar.component';
import { SharedModule } from '../shared/shared.module';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { ManageLeaveComponent } from './manage-leave/manage-leave.component';
import { TeamComponent } from './team/team.component';
import { HolidayListComponent } from './holiday-list/holiday-list.component';

@NgModule({
  declarations: [
    LeaveCalendarComponent,
    LandingPageComponent,
    ManageLeaveComponent,
    TeamComponent,
    HolidayListComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    SidenavRoutingModule,
    SharedModule,
  ],
})
export class SidenavModule {}
