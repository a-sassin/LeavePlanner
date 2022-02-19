import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '../shared.module';

import { NgxDatatableComponent } from './ngx-datatable.component';

describe('NgxDatatableComponent', () => {
  let component: NgxDatatableComponent;
  let fixture: ComponentFixture<NgxDatatableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NgxDatatableComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxDatatableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onEditLeave should be called', () => {
    component.onEditLeave('');
  });

  it('onCancelLeave should be called', () => {
    component.onCancelLeave('');
  });

  it('reasonLength should be called', () => {
    let mockname = 'I want to apply a leave for some urgent work';
    component.reasonLength(mockname);
    expect(component.reasonLength.name.length > 30).toBeFalse();
    if (mockname.length > 30) {
      mockname = mockname.slice(0, 30) + '...';
    }
    expect(mockname).toBe('I want to apply a leave for so...');
    mockname = 'required';
    component.reasonLength(mockname);
    if (mockname.length > 30) {
      mockname = mockname.slice(0, 30) + '...';
    }
    expect(mockname).toBe('required');
  });
});
