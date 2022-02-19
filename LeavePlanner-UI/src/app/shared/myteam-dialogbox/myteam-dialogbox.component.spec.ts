import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyteamDialogboxComponent } from './myteam-dialogbox.component';

describe('MyteamDialogboxComponent', () => {
  let component: MyteamDialogboxComponent;
  let fixture: ComponentFixture<MyteamDialogboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MyteamDialogboxComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyteamDialogboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
