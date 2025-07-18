import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyMeCoffeeComponent } from './buy-me-coffee.component';

describe('BuyMeCoffeeComponent', () => {
  let component: BuyMeCoffeeComponent;
  let fixture: ComponentFixture<BuyMeCoffeeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BuyMeCoffeeComponent]
    });
    fixture = TestBed.createComponent(BuyMeCoffeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
