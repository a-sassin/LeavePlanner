import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { EmployeesService } from 'src/app/services/employees.service';
import { TeamEmployeesService } from 'src/app/services/team-employees.service';
import { PopupComponent } from '../popup/popup.component';

@Component({
  selector: 'app-myteam-dialogbox',
  templateUrl: './myteam-dialogbox.component.html',
  styleUrls: ['./myteam-dialogbox.component.scss'],
})
export class MyteamDialogboxComponent implements OnInit {
  constructor(
    private readonly router: Router,
    private readonly empService: EmployeesService,
    private readonly teamService: TeamEmployeesService,
    private readonly dialog: MatDialog,
    private readonly service: AuthService,
    private readonly dialogRefernce: MatDialogRef<MyteamDialogboxComponent>
  ) {}
  teamData: any = [];
  floatvalue = 'auto';
  message = '';
  nameSearch: any = '';
  user: any = [];
  member = 'Members';
  data: any = [];
  teamEmployeeList: any = [];

  ngOnInit(): void {
    setTimeout(() => {
      this.getTeam();
    }, 0);
  }
  getTeam(): any {
    this.empService.getTeam().subscribe(
      (res) => {
        this.teamData = res.teams;
        if (!this.teamData.length) {
          this.message = res.message;
        }
        for (const key of this.teamData) {
          this.teamService.getEmployees(key.teamId).subscribe((resData) => {
            this.user = resData.data;
            if (this.user.length < 2) {
              this.member = this.user.length + ' Member';
            } else {
              this.member = this.user.length + ' Members';
            }
            this.data.push({
              name: key.name,
              member: this.member,
              teamId: key.teamId,
            });
          });
        }
      },
      (error) => {
        console.log('Error occured in fetching the teams', error);
      }
    );
  }
  navigate(teamName, teamId): any {
    this.router.navigate(['/dashboard/leave-calender'], {
      queryParams: {
        team: teamName,
        teamId,
      },
    });
  }
  navigateCreateTeam(): any {
    this.router.navigate(['/dashboard/create-team']);
  }

  deleteTeambox(teamName, teamId): any {
    this.dialog.open(PopupComponent, {
      width: '400px',
      height: '200px',
      disableClose: true,
      autoFocus: false,
      data: {
        teamName,
        teamId,
      },
    });
  }
  updateTeam(teamName, teamId): any {
    this.router.navigate(['/dashboard/update-team'], {
      queryParams: {
        teamName,
        teamId,
      },
    });
    this.dialogRefernce.close();
  }
  transferOwnership(teamName, teamId, requestTransfer = true): any {
    this.router.navigate(['/dashboard/transferOwnership'], {
      queryParams: {
        teamName,
        teamId,
        requestTransfer,
      },
    });
    this.dialogRefernce.close();
  }
  teamLength(name: any): any {
    if (name.length > 25) {
      name = name.slice(0, 25) + '...';
    }
    return name;
  }
}
