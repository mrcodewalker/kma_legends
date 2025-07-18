import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ScheduleResponse, CalendarEvent } from '../models/schedule.model';
import * as moment from 'moment';
import { createEvents, EventAttributes } from 'ics';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private lessonGroups: { [key: string]: { start: string; end: string } } = {
    '1,2,3': { start: '07:00', end: '09:25' },
    '4,5,6': { start: '09:35', end: '12:00' },
    '7,8,9': { start: '12:30', end: '14:55' },
    '10,11,12': { start: '15:05', end: '17:30' },
    '13,14,15,16': { start: '18:00', end: '20:30' }
  };

  constructor(private http: HttpClient) {}

  transformScheduleToEvents(schedule: ScheduleResponse): CalendarEvent[] {
    const events: CalendarEvent[] = [];
    
    schedule.data.student_schedule.forEach(course => {
      const days = course.study_days.split(' ');
      const lessonsList = course.lessons.split(' ');
      
      days.forEach((day, index) => {
        const lessons = lessonsList[index];
        const timeSlot = this.lessonGroups[lessons];
        
        if (!timeSlot) {
          console.warn(`Unknown lesson group: ${lessons}`);
          return;
        }
        
        const startDateTime = moment(`${day} ${timeSlot.start}`, 'DD/MM/YYYY HH:mm').toDate();
        const endDateTime = moment(`${day} ${timeSlot.end}`, 'DD/MM/YYYY HH:mm').toDate();
        
        events.push({
          title: `${course.course_name} (${course.course_code})`,
          start: startDateTime,
          end: endDateTime,
          location: course.study_location,
          teacher: course.teacher,
          courseCode: course.course_code
        });
      });
    });
    
    return events;
  }

  generateICSFile(events: CalendarEvent[]): Promise<string> {
    const icsEvents: EventAttributes[] = events.map(event => ({
      start: this.formatDateForICS(event.start),
      end: this.formatDateForICS(event.end),
      title: event.title,
      description: `Giảng viên: ${event.teacher}`,
      location: event.location,
      status: 'CONFIRMED' as const,
      busyStatus: 'BUSY' as const
    }));

    return new Promise((resolve, reject) => {
      const { error, value } = createEvents(icsEvents);
      if (error) {
        reject(error);
      }
      resolve(value || '');
    });
  }

  private formatDateForICS(date: Date): [number, number, number, number, number] {
    return [
      date.getFullYear(),
      date.getMonth() + 1, // months are 0-indexed in JS
      date.getDate(),
      date.getHours(),
      date.getMinutes()
    ];
  }

  async downloadICSFile(events: CalendarEvent[]): Promise<void> {
    try {
      const icsContent = await this.generateICSFile(events);
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', 'schedule.ics');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating ICS file:', error);
    }
  }
} 