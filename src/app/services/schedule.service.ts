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
  getLessonTime(lessons: number[]): { startTime: string; endTime: string } {
    if (!lessons || lessons.length === 0) {
      return { startTime: '', endTime: '' };
    }
    
    const sorted = [...lessons].sort((a, b) => a - b);
    const minLesson = sorted[0];
    const maxLesson = sorted[sorted.length - 1];

    const lessonStartTimes: { [key: number]: string } = {
      1: '07:00', 2: '07:45', 3: '08:40',
      4: '09:35', 5: '10:20', 6: '11:15',
      7: '12:30', 8: '13:15', 9: '14:10',
      10: '15:05', 11: '15:50', 12: '16:45',
      13: '18:00', 14: '18:45', 15: '19:40', 16: '20:25'
    };

    const lessonEndTimes: { [key: number]: string } = {
      1: '07:45', 2: '08:30', 3: '09:25',
      4: '10:20', 5: '11:05', 6: '12:00',
      7: '13:15', 8: '14:00', 9: '14:55',
      10: '15:50', 11: '16:35', 12: '17:30',
      13: '18:45', 14: '19:30', 15: '20:25', 16: '21:10'
    };

    const startTime = lessonStartTimes[minLesson] || '';
    const endTime = lessonEndTimes[maxLesson] || '';

    return { startTime, endTime };
  }

  constructor(private http: HttpClient) {}

  transformScheduleToEvents(schedule: ScheduleResponse): CalendarEvent[] {
    const events: CalendarEvent[] = [];
    
    schedule.data.student_schedule.forEach(course => {
      const days = course.study_days.split(' ');
      const lessonsList = course.lessons.split(' ');
      const locationsList = course.study_location ? course.study_location.split(';') : [];
      
      days.forEach((day, index) => {
        const lessonsStr = lessonsList[index];
        if (!lessonsStr) return;

        const lessons = lessonsStr.split(',').map(Number);
        const { startTime, endTime } = this.getLessonTime(lessons);
        
        if (!startTime || !endTime) {
          console.warn(`Unknown or invalid lessons: ${lessonsStr}`);
          return;
        }
        
        const location = locationsList[index] || locationsList[0] || course.study_location || '';
        
        const startDateTime = moment(`${day} ${startTime}`, 'DD/MM/YYYY HH:mm').toDate();
        const endDateTime = moment(`${day} ${endTime}`, 'DD/MM/YYYY HH:mm').toDate();
        
        events.push({
          title: `${course.course_name} (${course.course_code})`,
          start: startDateTime,
          end: endDateTime,
          location: location,
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