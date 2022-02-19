import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { SidenavModule } from '../sidenav/sidenav.module';
import { SortAlphabetPipe } from './sort-alphabet.pipe';

describe('SortAlphabetPipe', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        BrowserAnimationsModule,
        SidenavModule,
      ],
    }).compileComponents();
  });
  it('create an instance', () => {
    const pipe = new SortAlphabetPipe();
    expect(pipe).toBeTruthy();
  });
});
