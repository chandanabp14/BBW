import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupReport } from './setup-report';

describe('SetupReport', () => {
  let component: SetupReport;
  let fixture: ComponentFixture<SetupReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetupReport],
    }).compileComponents();

    fixture = TestBed.createComponent(SetupReport);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
