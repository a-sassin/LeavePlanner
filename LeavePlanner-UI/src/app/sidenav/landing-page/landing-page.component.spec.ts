import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingPageComponent } from './landing-page.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { DeclareleaveDialogboxComponent } from 'src/app/shared/declareleave-dialogbox/declareleave-dialogbox.component';
import { MyteamDialogboxComponent } from 'src/app/shared/myteam-dialogbox/myteam-dialogbox.component';

export class MatDialogMock {
  open(): any {
    return true;
  }
}

describe('LandingPageComponent', () => {
  let component: LandingPageComponent;
  let fixture: ComponentFixture<LandingPageComponent>;
  const matDialog = new MatDialogMock();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LandingPageComponent],
      imports: [HttpClientTestingModule, RouterTestingModule, MatDialogModule],
      providers: [{ provide: MatDialog, useValue: matDialog }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(`should have as title 'Welcome,'`, () => {
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('Welcome,');
  });

  it('should render title in a h3 tag', () => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h3').textContent).toContain('Welcome,');
  });

  it('Call Declare Leave Dialog', () => {
    spyOn(matDialog, 'open');
    component.declareLeaveDialog();
    expect(matDialog.open).toHaveBeenCalled();
    expect(component.dialog.open).toHaveBeenCalledWith(
      DeclareleaveDialogboxComponent,
      {
        width: '600px',
        height: '600px',
        autoFocus: false,
        disableClose: true,
      }
    );
  });

  it('Call my team dialog', () => {
    spyOn(matDialog, 'open');
    component.myTeamDialog();
    expect(matDialog.open).toHaveBeenCalled();
    expect(component.dialog.open).toHaveBeenCalledWith(
      MyteamDialogboxComponent,
      {
        width: '600px',
        height: '600px',
        autoFocus: false,
        panelClass: 'myapp-no-padding-dialog',
      }
    );
  });
});
