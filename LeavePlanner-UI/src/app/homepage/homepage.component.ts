import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { EmployeesService } from '../services/employees.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
})
export class HomepageComponent implements OnInit {
  isLogIn = true;
  isAdmin = false;
  message = '';
  teamData: any = [];
  count = 0;
  user: any;
  constructor(
    private readonly authservice: AuthService,
    private readonly router: Router,
    private readonly empService: EmployeesService,
    private readonly snackBar: MatSnackBar
  ) {
    const data = JSON.parse(localStorage.getItem('userData'));
    if (data != null) {
      this.authservice.isLogIn.next(false);
    }
    this.authservice.isLogIn.subscribe((res) => {
      this.isLogIn = res;
    });
  }

  ngOnInit(): any {
    this.empService.teamname.subscribe((res) => {
      this.teamData.push(res);
    });
    this.getLocalStorageData();
  }

  getLocalStorageData(): any {
    this.empService.userLocalStorage.subscribe((res) => {
      this.user = res.pendingRequests;
      this.count = this.user.length;
      if (res.isAdmin) {
        this.isAdmin = true;
      } else {
        this.isAdmin = false;
      }
    });
  }

  onDecline(resMessage: string, teamId: string, delIndex: number): any {
    this.empService.resTransferRequest(resMessage, teamId).subscribe(
      (res) => {
        this.reloadLocalStorage(delIndex);
        this.count -= 1;
        if (delIndex >= 0) {
          this.user.splice(delIndex, 1);
        }
        this.snackBar.open(res.message, 'Ok', {
          duration: 2000,
        });
      },
      (err) => {
        console.log(err);
      }
    );
  }

  onAccept(resMessage: string, teamId: string, delIndex: number): any {
    this.empService.resTransferRequest(resMessage, teamId).subscribe(
      (res) => {
        this.reloadLocalStorage(delIndex);
        this.count -= 1;
        if (delIndex >= 0) {
          this.user.splice(delIndex, 1);
        }
        this.snackBar.open(res.message, 'Ok', {
          duration: 2000,
        });
      },
      (err) => {
        console.log(err);
      }
    );
  }
  reloadLocalStorage(index: number): any {
    let items = JSON.parse(localStorage.getItem('userData'));
    if (items.pendingRequests) {
      items.pendingRequests.splice(index, 1);
    }
    items = JSON.stringify(items);
    localStorage.setItem('userData', items);
  }

  onClick(sidenav: any): any {
    this.logout();
    sidenav.close();
  }

  logout(): any {
    this.authservice.logout().subscribe(
      (res) => {
        this.authservice.isLogIn.next(true);
        this.count = 0;
        localStorage.removeItem('userData');
        this.router.navigate(['/login']);
      },
      (err) => {
        console.log(err);
      }
    );
  }
}
