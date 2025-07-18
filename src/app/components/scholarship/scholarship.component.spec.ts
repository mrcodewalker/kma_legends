import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScholarshipComponent } from './scholarship.component';

describe('ScholarshipComponent', () => {
  let component: ScholarshipComponent;
  let fixture: ComponentFixture<ScholarshipComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ScholarshipComponent]
    });
    fixture = TestBed.createComponent(ScholarshipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
