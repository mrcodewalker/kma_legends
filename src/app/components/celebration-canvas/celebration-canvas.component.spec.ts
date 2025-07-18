import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CelebrationCanvasComponent } from './celebration-canvas.component';

describe('CelebrationCanvasComponent', () => {
  let component: CelebrationCanvasComponent;
  let fixture: ComponentFixture<CelebrationCanvasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CelebrationCanvasComponent]
    });
    fixture = TestBed.createComponent(CelebrationCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
