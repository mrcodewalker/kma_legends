import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualCalendarComponent } from './virtual-calendar.component';

describe('VirtualCalendarComponent', () => {
  let component: VirtualCalendarComponent;
  let fixture: ComponentFixture<VirtualCalendarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VirtualCalendarComponent]
    });
    fixture = TestBed.createComponent(VirtualCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
