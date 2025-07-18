import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CelebrationService {
  private celebrationSubject = new BehaviorSubject<boolean>(false);
  celebration$ = this.celebrationSubject.asObservable();

  startCelebration() {
    this.celebrationSubject.next(true);
  }

  stopCelebration() {
    this.celebrationSubject.next(false);
  }
}
