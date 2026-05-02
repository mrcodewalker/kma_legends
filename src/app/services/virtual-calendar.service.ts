import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { VirtualCalendarResponse, CourseClass } from '../models/virtual-calendar.model';

@Injectable({
  providedIn: 'root'
})
export class VirtualCalendarService {
  private selectedClassesSubject = new BehaviorSubject<CourseClass[]>([]);
  selectedClasses$ = this.selectedClassesSubject.asObservable();

  constructor() {}

  getVirtualCalendarData(): Observable<VirtualCalendarResponse> {
    const data = localStorage.getItem('virtual_calendar_secret');
    if (data) {
      return of(JSON.parse(data));
    }
    return of({ 
      data: { virtual_calendar: [], student_info: {} as any }, 
      code: "404", 
      message: "No data found" 
    });
  }

  addSelectedClass(newClass: CourseClass) {
    const currentClasses = this.selectedClassesSubject.value;
    this.selectedClassesSubject.next([...currentClasses, newClass]);
  }

  removeSelectedClass(className: string) {
    const currentClasses = this.selectedClassesSubject.value;
    this.selectedClassesSubject.next(
      currentClasses.filter(c => c.className !== className)
    );
  }

  getSelectedClasses(): CourseClass[] {
    return this.selectedClassesSubject.value;
  }

  clearSelectedClasses() {
    this.selectedClassesSubject.next([]);
  }
} 