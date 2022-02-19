import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  startWith,
  switchMap,
} from 'rxjs/operators';
import { EmployeesService } from 'src/app/services/employees.service';
import { TeamEmployeesService } from 'src/app/services/team-employees.service';
import { MyteamDialogboxComponent } from 'src/app/shared/myteam-dialogbox/myteam-dialogbox.component';
import { PopupComponent } from 'src/app/shared/popup/popup.component';
export interface Employees {
  name: string;
  empId: string;
  email?: string;
}
@Component({
  selector: 'app-team-dialogbox',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss'],
})
export class TeamComponent implements OnInit {
  constructor(
    private readonly empServices: EmployeesService,
    private readonly snackBar: MatSnackBar,
    private readonly route: ActivatedRoute,
    private readonly teamService: TeamEmployeesService,
    private readonly router: Router,
    private readonly dialog: MatDialog
  ) {}
  selectable = true;
  removable = true;
  teamForm: FormGroup;
  allSelectedEmployeesList: Employees[] = [];
  teamEmployeesList: Employees[] = [];
  deletedTeamEmployeesList: Employees[] = [];
  teamId: string;
  teamName: string;
  isEdit: boolean;
  ownerData: any;
  ownerCred: any;
  updatedTeamName: string;
  isTransfer = false;
  reqTransfer: boolean;
  reqOwnerId: string;
  transferOwnerData: any;
  filteredEmployees: Employees[] = [];
  listAllEmployeess: Employees[] = [];
  filteredTeamEmployees: Observable<Employees[]>;

  @ViewChild('employeeInput') employeeInput: ElementRef<HTMLInputElement>;
  @ViewChild('delemployeeInput') delemployeeInput: ElementRef<HTMLInputElement>;
  @ViewChild('transferOwner') transferOwner: ElementRef<HTMLInputElement>;

  ngOnInit(): any {
    this.getRoutesParams();
    this.formTeam();
    this.filtername();
    setTimeout(() => {
      this.userInfo();
    }, 0);
  }

  getRoutesParams(): any {
    this.route.queryParams.subscribe((params: Params) => {
      this.teamId = params.teamId;
      this.teamName = params.teamName;
      this.isEdit = !!(params.teamId && !params.requestTransfer);
      this.reqTransfer = !!params.requestTransfer;
    });
  }

  formTeam(): any {
    if (this.isEdit && !this.reqTransfer) {
      this.teamForm = new FormGroup({
        teamName: new FormControl(this.teamName, [
          this.noWhitespaceValidator,
          Validators.required,
        ]),
        addTeamMember: new FormControl(''),
        deleteTeamMember: new FormControl(''),
      });
    } else if (!this.isEdit && !this.reqTransfer) {
      this.teamForm = new FormGroup({
        teamName: new FormControl('', [
          Validators.required,
          this.noWhitespaceValidator,
        ]),
        addTeamMember: new FormControl(''),
      });
    } else {
      this.teamForm = new FormGroup({
        teamName: new FormControl(this.teamName),
        transferOwnership: new FormControl('', Validators.required),
      });
    }
  }

  filtername(): any {
    if (!this.reqTransfer) {
      this.teamForm
        .get('addTeamMember')
        .valueChanges.pipe(
          debounceTime(500),
          distinctUntilChanged(),
          filter((data) => data && data.length > 0),
          switchMap((data) => this.empServices.getEmployees(data))
        )
        .subscribe((res: any) => {
          if (res.data) {
            this.filteredEmployees = res.data.filter(
              (emp) =>
                !this.allSelectedEmployeesList.find(
                  (emplist) => emplist.empId === emp.empId
                ) && this.ownerCred.empID !== emp.empId
            );
          }
        });
    }
    if (this.isEdit) {
      this.filteredTeamEmployees = this.teamForm
        .get('deleteTeamMember')
        .valueChanges.pipe(
          startWith(''),
          map((employee: string | null) =>
            employee ? this._filterTeamEmp(employee) : this.teamEmployeesList
          )
        );
    }
    if (this.reqTransfer) {
      this.teamForm
        .get('transferOwnership')
        .valueChanges.pipe(
          debounceTime(500),
          distinctUntilChanged(),
          filter((data) => data && data.length > 0),
          switchMap((data) => this.empServices.getEmployees(data))
        )
        .subscribe((res: any) => {
          if (res.data) {
            this.listAllEmployeess = res.data.filter(
              (emp) => this.ownerCred.empID !== emp.empId
            );
          }
        });
    }
  }

  private _filterTeamEmp(value: string): Employees[] {
    const filterValue = value ? value.toString().toLowerCase() : '';
    const teamMatches = this.teamEmployeesList.filter((option) =>
      option.name.toLowerCase().includes(filterValue)
    );
    return teamMatches.filter(
      (emp) => !this.deletedTeamEmployeesList.find((emplist) => emplist === emp)
    );
  }

  private noWhitespaceValidator(control: FormControl): { whitespace: boolean } {
    const isSpace = (control.value || '').startsWith(' ');
    return isSpace ? { whitespace: true } : null;
  }

  userInfo(): any {
    this.ownerCred = JSON.parse(localStorage.getItem('userData')) || '';
    if (this.isEdit) {
      this.getTeamDetail();
    } else if (!this.isEdit && !this.reqTransfer) {
      this.ownerData = {
        name: this.ownerCred.name,
        empId: this.ownerCred.empID,
      };
    }
  }

  getTeamDetail(): any {
    this.teamService.getEmployees(this.teamId).subscribe((res) => {
      for (const key of res.data) {
        this.teamEmployeesList.push({
          name: key.name,
          empId: key.empId,
        });
      }
    });
  }

  remove(employee: Employees): any {
    const index = this.allSelectedEmployeesList.indexOf(employee);

    if (index >= 0) {
      this.allSelectedEmployeesList.splice(index, 1);
    }
  }

  removeemployee(employee: Employees): any {
    const delIndex = this.deletedTeamEmployeesList.indexOf(employee);
    if (delIndex >= 0) {
      this.deletedTeamEmployeesList.splice(delIndex, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): any {
    if (!event.option) {
      return;
    }
    const value = event.option.value;
    if (value && !this.allSelectedEmployeesList.includes(value)) {
      this.allSelectedEmployeesList.push(value);
      this.filteredEmployees = [];
      this.employeeInput.nativeElement.value = '';
    }
  }

  transfer(event: MatAutocompleteSelectedEvent): any {
    if (!event.option) {
      return;
    }
    const value = event.option.value;
    this.isTransfer = true;
    this.reqOwnerId = value.empId;
    this.listAllEmployeess = [];
  }

  displayFn(emp: Employees): any {
    return emp && emp.name ? emp.name : '';
  }

  selecteddelemp(event: MatAutocompleteSelectedEvent): any {
    if (!event.option) {
      return;
    }
    const value = event.option.value;
    if (value && !this.deletedTeamEmployeesList.includes(value)) {
      this.deletedTeamEmployeesList.push(value);
      this.delemployeeInput.nativeElement.value = '';
    }
  }

  onUpdate(): any {
    if (!this.teamForm.valid) {
      return;
    }
    const teamName = this.teamForm.value.teamName.trim();
    const memberstoadd: any = [];
    const memberstodelete: any = [];
    for (const key in this.allSelectedEmployeesList) {
      if (key) {
        memberstoadd.push({
          name: this.allSelectedEmployeesList[key].name,
          empId: this.allSelectedEmployeesList[key].empId,
        });
      }
    }
    for (const key in this.deletedTeamEmployeesList) {
      if (key) {
        memberstodelete.push({
          name: this.deletedTeamEmployeesList[key].name,
          empId: this.deletedTeamEmployeesList[key].empId,
        });
      }
    }
    if (
      (this.teamEmployeesList.length === 1 ||
        this.deletedTeamEmployeesList.length ===
          this.teamEmployeesList.length) &&
      this.deletedTeamEmployeesList.find(
        (emplist) => emplist.empId === this.ownerCred.empID
      )
    ) {
      this.dialog.open(PopupComponent, {
        width: '400px',
        height: '205px',
        disableClose: true,
        autoFocus: false,
        data: {
          teamId: this.teamId,
          teamName,
          memberstoadd,
          memberstodelete,
          flag: 'delOwner',
        },
      });
    } else {
      this.empServices
        .updateTeam(this.teamId, teamName, memberstoadd, memberstodelete)
        .subscribe(
          (resData) => {
            this.allSelectedEmployeesList = [];
            this.deletedTeamEmployeesList = [];
            this.teamEmployeesList = resData.team.members;
            this.updatedTeamName = resData.team.name;
            this.teamForm.reset({ teamName: this.updatedTeamName });
            this.snackBar.open(resData.message, 'Ok', {
              duration: 2000,
            });
            this.router.navigate(['/dashboard/update-team'], {
              queryParams: {
                teamName: this.updatedTeamName,
                teamId: this.teamId,
              },
            });
          },
          (error) => {
            console.log(error);
          }
        );
      this.employeeInput.nativeElement.value = '';
      this.delemployeeInput.nativeElement.value = '';
    }
  }

  onCreate(): any {
    if (!this.teamForm.valid) {
      return;
    }
    const teamName = this.teamForm.value.teamName.trim();
    const member: any = [];
    for (const key in this.allSelectedEmployeesList) {
      if (key) {
        member.push({
          name: this.allSelectedEmployeesList[key].name,
          empId: this.allSelectedEmployeesList[key].empId,
        });
      }
    }
    if (this.ownerData) {
      member.push(this.ownerData);
    }
    this.empServices.createTeam(teamName, member).subscribe(
      (resData) => {
        const teamObject = {
          name: resData.team.name,
          owner: resData.team.owner,
          teamId: resData.team.teamId,
        };
        this.allSelectedEmployeesList = [];
        this.teamForm.reset();
        this.empServices.teamname.next(teamObject);
        this.snackBar.open(resData.message, 'Ok', {
          duration: 2000,
        });
      },
      (error) => {
        console.log(error);
      }
    );
    this.employeeInput.nativeElement.value = '';
  }

  onTransferOnwership(): any {
    this.empServices
      .reqTransferOwnership(this.teamId, this.reqOwnerId)
      .subscribe(
        (res) => {
          this.isTransfer = false;
          this.transferOwner.nativeElement.value = '';
          this.snackBar.open(res.message, 'Ok', {
            duration: 2000,
          });
        },
        (err) => {
          console.log(err);
        }
      );
  }

  onCancel(): any {
    if (this.reqTransfer) {
      this.isTransfer = false;
      this.listAllEmployeess = [];
      this.transferOwner.nativeElement.value = '';
      this.teamForm.reset({ teamName: this.teamName });
    } else {
      this.allSelectedEmployeesList = [];
      this.employeeInput.nativeElement.value = '';
      this.filteredEmployees = [];
      if (this.isEdit) {
        this.teamForm.reset(
          !!this.updatedTeamName
            ? { teamName: this.updatedTeamName }
            : { teamName: this.teamName }
        );
        this.deletedTeamEmployeesList = [];
        this.delemployeeInput.nativeElement.value = '';
      } else if (!this.isEdit && !this.reqTransfer) {
        this.teamForm.reset();
      }
    }
  }

  onArrow(): any {
    this.router.navigate(['']);
    if (this.isEdit || this.reqTransfer) {
      this.openDialogBox();
    }
  }
  openDialogBox(): any {
    this.dialog.open(MyteamDialogboxComponent, {
      width: '600px',
      height: '600px',
      autoFocus: false,
      panelClass: 'myapp-no-padding-dialog',
    });
  }
  checkDisabled(): any {
    if (
      this.teamForm.valid &&
      ((this.teamForm.controls.teamName.dirty &&
        !this.teamForm.controls.teamName.value.endsWith(' ') &&
        this.teamForm.controls.teamName.value !== this.teamName) ||
        this.allSelectedEmployeesList.length > 0 ||
        this.deletedTeamEmployeesList.length > 0 ||
        (this.isTransfer &&
          this.teamForm.controls.transferOwnership.value !== ''))
    ) {
      return false;
    }
    return true;
  }
}
