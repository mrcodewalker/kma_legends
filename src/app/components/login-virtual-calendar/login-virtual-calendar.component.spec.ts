import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginVirtualCalendarComponent } from './login-virtual-calendar.component';

describe('LoginVirtualCalendarComponent', () => {
  let component: LoginVirtualCalendarComponent;
  let fixture: ComponentFixture<LoginVirtualCalendarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoginVirtualCalendarComponent]
    });
    fixture = TestBed.createComponent(LoginVirtualCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
