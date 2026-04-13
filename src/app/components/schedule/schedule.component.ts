import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ScheduleService } from '../../services/schedule.service';
import { ScheduleResponse, CalendarEvent } from '../../models/schedule.model';
import { EventDialogComponent } from './event-dialog/event-dialog.component';
import * as moment from 'moment';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next,today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    slotMinTime: '07:00:00',
    slotMaxTime: '22:00:00',
    allDaySlot: false,
    height: 'auto',
    locale: 'vi',
    weekends: true,
    editable: false,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    eventClick: this.handleEventClick.bind(this),
    eventDidMount: this.handleEventMount.bind(this),
    eventContent: this.customEventContent.bind(this),
    views: {
      timeGridWeek: {
        titleFormat: { year: 'numeric', month: 'short', day: '2-digit' },
        dayHeaderFormat: { weekday: 'short', month: 'numeric', day: 'numeric', omitCommas: true }
      },
      timeGridDay: {
        titleFormat: { year: 'numeric', month: 'long', day: '2-digit', weekday: 'long' }
      }
    }
  };

  events: CalendarEvent[] = [];
  studentInfo: any;
  loading = true;
  error: string = '';
  showColorLegend = false;

  private readonly COLOR_STORAGE_KEY = 'schedule_course_colors';
  private readonly DEFAULT_PALETTE = [
    '#bfdbfe', // blue-200
    '#bbf7d0', // green-200
    '#e9d5ff', // purple-200
    '#fed7aa', // orange-200
    '#fbcfe8', // pink-200
    '#99f6e4', // teal-200
    '#fef08a', // yellow-200
    '#c7d2fe', // indigo-200
    '#a5f3fc', // cyan-200
    '#fecdd3', // rose-200
    '#d9f99d', // lime-200
    '#fde68a', // amber-200
    '#bae6fd', // sky-200
    '#e9d5ff', // violet-200
    '#fca5a5', // red-200
  ];

  courseColorMap: { [courseName: string]: string } = {};
  courseNames: string[] = [];

  constructor(
    private scheduleService: ScheduleService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    try {
      const scheduleData = localStorage.getItem('schedule_secret');

      if (!scheduleData) {
        throw new Error('No schedule data found');
      }

      const scheduleResponse: ScheduleResponse = JSON.parse(scheduleData);

      if (!scheduleResponse || !scheduleResponse.data || !scheduleResponse.data.student_info || !scheduleResponse.data.student_schedule) {
        throw new Error('Invalid schedule data format');
      }

      this.studentInfo = scheduleResponse.data.student_info;
      this.events = this.scheduleService.transformScheduleToEvents(scheduleResponse);
      this.loadCourseColors();
      this.assignEventColors();

      // Map events to include location in extendedProps
      const calendarEvents = this.events.map(event => {
        const courseName = event.title.split('(')[0].trim();
        const color = this.courseColorMap[courseName];
        return {
          ...event,
          backgroundColor: color,
          borderColor: color,
          textColor: this.getContrastColor(color),
          classNames: [],
          extendedProps: {
            location: event.location,
            teacher: event.teacher,
            courseCode: event.courseCode,
            color  // pass color into extendedProps as fallback
          }
        };
      });

      this.calendarOptions.events = calendarEvents;

    } catch (error) {
      console.error('Error loading schedule data:', error);
      this.error = 'Có lỗi xảy ra khi tải lịch học. Vui lòng đăng nhập lại.';
      this.handleLogout();
    } finally {
      this.loading = false;
    }
  }

  handleEventClick(clickInfo: EventClickArg) {
    const event = {
      title: clickInfo.event.title,
      start: clickInfo.event.start!,
      end: clickInfo.event.end!,
      location: clickInfo.event.extendedProps['location'],
      teacher: clickInfo.event.extendedProps['teacher'],
      courseCode: clickInfo.event.extendedProps['courseCode']
    };

    this.dialog.open(EventDialogComponent, {
      data: {
        event: event,
        formattedDate: moment(event.start).format('dddd, DD/MM/YYYY'),
        formattedTime: `${moment(event.start).format('HH:mm')} - ${moment(event.end).format('HH:mm')}`
      },
      panelClass: 'event-dialog-container',
      maxWidth: '95vw',
      maxHeight: '90vh'
    });
  }

  handleEventMount(arg: any) {
    const eventEl = arg.el;
    eventEl.style.cursor = 'pointer';
    eventEl.style.borderRadius = '4px';
    eventEl.style.padding = '2px 4px';
    eventEl.classList.add('hover:shadow-lg', 'transition-shadow');

    // Apply color directly to DOM — most reliable way with FullCalendar
    const color: string = arg.event.backgroundColor || arg.event.extendedProps?.['color'];
    if (color) {
      eventEl.style.backgroundColor = color;
      eventEl.style.borderColor = color;
      eventEl.style.borderLeftColor = color;
      // Set text color based on luminance
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const textColor = lum > 0.55 ? '#1f2937' : '#ffffff';
      eventEl.style.color = textColor;
      // Also set on inner elements
      eventEl.querySelectorAll('.fc-event-title, .fc-event-time, .fc-event-main').forEach((el: any) => {
        el.style.color = textColor;
      });
    }
  }

  exportToICS(): void {
    this.scheduleService.downloadICSFile(this.events);
  }

  logout(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Xác nhận Đăng xuất',
        message: 'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?',
        status: 'error',
        confirmText: 'Đăng xuất',
        cancelText: 'Hủy'
      },
      panelClass: 'confirm-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.handleLogout();
      }
    });
  }

  private loadCourseColors(): void {
    try {
      const saved = localStorage.getItem(this.COLOR_STORAGE_KEY);
      this.courseColorMap = saved ? JSON.parse(saved) : {};
    } catch { this.courseColorMap = {}; }
  }

  private saveCourseColors(): void {
    localStorage.setItem(this.COLOR_STORAGE_KEY, JSON.stringify(this.courseColorMap));
  }

  private assignEventColors(): void {
    // Collect unique course names
    const names = [...new Set(this.events.map(e => e.title.split('(')[0].trim()))];
    this.courseNames = names;

    // Assign default color for any course not yet in map
    names.forEach((name, i) => {
      if (!this.courseColorMap[name]) {
        this.courseColorMap[name] = this.DEFAULT_PALETTE[i % this.DEFAULT_PALETTE.length];
      }
    });
    this.saveCourseColors();
  }

  updateCourseColor(courseName: string, color: string): void {
    this.courseColorMap[courseName] = color;
    this.saveCourseColors();
    this.refreshCalendarColors();
  }

  resetColors(): void {
    this.courseNames.forEach((name, i) => {
      this.courseColorMap[name] = this.DEFAULT_PALETTE[i % this.DEFAULT_PALETTE.length];
    });
    this.saveCourseColors();
    this.refreshCalendarColors();
  }

  private refreshCalendarColors(): void {
    const calendarEvents = this.events.map(event => {
      const courseName = event.title.split('(')[0].trim();
      const color = this.courseColorMap[courseName];
      return {
        ...event,
        backgroundColor: color,
        borderColor: color,
        textColor: this.getContrastColor(color),
        classNames: [],
        extendedProps: {
          location: event.location,
          teacher: event.teacher,
          courseCode: event.courseCode,
          color
        }
      };
    });
    this.calendarOptions = { ...this.calendarOptions, events: calendarEvents };
  }

  // Returns black or white depending on background luminance
  getContrastColor(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.55 ? '#1f2937' : '#ffffff';
  }

  private customEventContent(arg: any) {
    const timeText = arg.timeText.split(' - ')[0]; // Only show start time
    const location = arg.event.extendedProps.location.split(' ')[0]; // Only show room number
    const title = arg.event.title.split('(')[0].trim(); // Get course name without code

    return {
      html: `
        <div class="fc-event-content" style="padding: 2px 4px; font-size: 0.9em;">
          <div style="font-weight: bold;">${timeText}</div>
          <div class="hidden sm:block" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${title}</div>
          <div>${location}</div>
        </div>
      `
    };
  }

  private handleLogout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
