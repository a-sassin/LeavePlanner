import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { TeamEmployeesService } from './team-employees.service';

describe('TeamEmployeesService', () => {
  let service: TeamEmployeesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
    });
    service = TestBed.inject(TeamEmployeesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('be able to retrieve getEmployees from the API via GET', () => {
    const dummyPosts = [
      {
        data: [
          {
            name: 'Madhavi Shinde',
            empId: 'GS-0770',
            leaves: [],
          },
        ],
      },
    ];
    service
      .getleavesByMonth('6076ccdd3c335d001260afc3', '04', 2021)
      .subscribe((posts) => {
        expect(posts.length).toBe(dummyPosts.length);
        expect(posts).toEqual(dummyPosts);
      });
  });

  it('Should call absent employee API', () => {
    const absentEmployee = [
      {
        message: 'Absent marked successfully',
      },
    ];
    service
      .absentEmployee(
        '04-13-2021',
        'GS-0410',
        'Lakhmirupa Reddy',
        '607698e23c335d001260afbd'
      )
      .subscribe((posts) => {
        expect(posts.length).toBe(absentEmployee.length);
        expect(posts).toEqual(absentEmployee);
      });
  });
});
