import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InspectionReport } from './inspection-report';

describe('InspectionReport', () => {
  let component: InspectionReport;
  let fixture: ComponentFixture<InspectionReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InspectionReport],
    }).compileComponents();

    fixture = TestBed.createComponent(InspectionReport);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
