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

  private colorClasses = [
    'event-blue', 
    'event-green', 
    'event-purple', 
    'event-orange', 
    'event-pink',
    'event-teal',
    'event-yellow',
    'event-indigo',
    'event-cyan',
    'event-rose'
  ];

  constructor(
    private scheduleService: ScheduleService,
    private router: Router,
    private dialog: MatDialog
  ) {}

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
      this.assignEventColors();
      
      // Map events to include location in extendedProps
      const calendarEvents = this.events.map(event => ({
        ...event,
        title: event.title,
        extendedProps: {
          location: event.location,
          teacher: event.teacher,
          courseCode: event.courseCode
        }
      }));
      
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
    // Add custom styling to event elements
    const eventEl = arg.el;
    eventEl.style.cursor = 'pointer';
    eventEl.style.borderRadius = '4px';
    eventEl.style.padding = '2px 4px';
    
    // Add hover effect class
    eventEl.classList.add('hover:shadow-lg', 'transition-shadow');
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

  private assignEventColors(): void {
    this.events.forEach(event => {
      const randomIndex = Math.floor(Math.random() * this.colorClasses.length);
      event.className = [this.colorClasses[randomIndex]];
    });
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
