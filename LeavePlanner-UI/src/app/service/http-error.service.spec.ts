import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { AlertPopupComponent } from '../shared/alert-popup/alert-popup.component';
import { SharedModule } from '../shared/shared.module';

import { HttpErrorService } from './http-error.service';

describe('HttpErrorService', () => {
  let service: HttpErrorService;
  let dialogSpy: jasmine.Spy;
  const dialogRefSpyObj = jasmine.createSpyObj({
    afterClosed: of({}),
    close: null,
  });

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [SharedModule, BrowserAnimationsModule],
      providers: [HttpErrorService],
    });
    service = TestBed.inject(HttpErrorService);
  });

  beforeEach(() => {
    dialogSpy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(
      dialogRefSpyObj
    );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('showerror should be called', () => {
    service.showError('error');
    expect(service.dialog.open).toHaveBeenCalled();
    expect(service.dialog.open).toHaveBeenCalledWith(AlertPopupComponent, {
      width: '400px',
      data: {
        error: 'error',
      },
    });
  });
});
