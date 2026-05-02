import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { VirtualCalendarResponse, VirtualCalendarItem, CourseClass, ScheduleConflict, SelectedClass, LessonTime } from '../../models/virtual-calendar.model';
import { VirtualCalendarService } from '../../services/virtual-calendar.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { CalendarOptions, EventInput, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventDialogComponent } from '../schedule/event-dialog/event-dialog.component';

@Component({
  selector: 'app-virtual-calendar',
  templateUrl: './virtual-calendar.component.html',
  styleUrls: ['./virtual-calendar.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ height: 0, opacity: 0 }),
        animate('200ms ease-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ height: '*', opacity: 1 }),
        animate('200ms ease-in', style({ height: 0, opacity: 0 }))
      ])
    ])
  ]
})
export class VirtualCalendarComponent implements OnInit {
  virtualCalendarData: VirtualCalendarResponse | null = null;
  availableCourseBlocks: string[] = [];
  selectedCourseBlock: string = '';
  availableCourses: { name: string; code: string }[] = [];
  selectedCourse: string = '';
  availableClasses: CourseClass[] = [];
  selectedClass: CourseClass | null = null;
  selectedSchedule: any[] = [];
  temporarySelectedClasses: SelectedClass[] = [];
  savedSelectedClasses: SelectedClass[] = [];
  isClassTableVisible: boolean = true;
  isSelectedClassesVisible: boolean = true;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next',
      center: 'title',
      right: 'dayGridMonth'
    },
    slotMinTime: '07:00:00',
    slotMaxTime: '21:00:00',
    allDaySlot: false,
    height: 'auto',
    locale: 'en',
    events: [],
    initialDate: new Date(), // First day of the semester
    slotDuration: '00:45:00', // Duration for each slot (matches with lesson duration)
    snapDuration: '00:45:00',
    eventDisplay: 'block',
    displayEventTime: true,
    displayEventEnd: true,
    nowIndicator: true,
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    eventClick: this.handleEventClick.bind(this),
    eventContent: this.customEventContent.bind(this)
  };

  private resizeListener: () => void;

  constructor(
    private router: Router,
    private virtualCalendarService: VirtualCalendarService,
    private dialog: MatDialog
  ) {
    // Initialize resize listener
    this.resizeListener = () => {
      if (this.temporarySelectedClasses.length > 0) {
        this.updateCalendarEvents();
      }
    };
  }

  ngOnInit(): void {
    // Add resize event listener
    window.addEventListener('resize', this.resizeListener);

    const virtualCalendarSecret = localStorage.getItem('virtual_calendar_secret');
    if(!virtualCalendarSecret) {
      this.router.navigate(['/login-virtual-calendar']);
      return;
    }

    this.virtualCalendarService.getVirtualCalendarData().subscribe({
      next: (data) => {
        this.virtualCalendarData = data;
        // console.log(this.virtualCalendarData);
        this.initializeFilters();
        // Load saved classes from localStorage
        this.loadSavedClasses();
      }
    });
  }

  ngOnDestroy(): void {
    // Remove resize event listener
    window.removeEventListener('resize', this.resizeListener);
  }
  subString(str: string): string {
    if(str.length>50) {
      return str.substring(0,20) + '...';
    }
    return str;
  }

  isClassSelected(classItem: CourseClass): boolean {
    return this.temporarySelectedClasses.some(
      c => c.details.course_name === classItem.details.course_name
    );
  }

  private getLessonTime(lessons: number[]): LessonTime {
    const lessonStr = lessons.sort().join(',');
    let startTime = '';
    let endTime = '';

    switch (lessonStr) {
      case "1,2,3":
        startTime = "07:00";
        endTime = "09:25";
        break;
      case "4,5,6":
        startTime = "09:35";
        endTime = "12:00";
        break;
      case "7,8,9":
        startTime = "12:30";
        endTime = "14:55";
        break;
      case "10,11,12":
        startTime = "15:05";
        endTime = "17:30";
        break;
      case "13,14,15,16":
        startTime = "18:00";
        endTime = "20:30";
        break;
    }

    return { startTime, endTime };
  }

  private initializeFilters() {
    if (!this.virtualCalendarData) return;

    this.availableCourseBlocks = Array.from(
      new Set(this.virtualCalendarData.data.virtual_calendar.map(item => item.course))
    ).sort();
  }

  onCourseBlockSelect(courseBlock: string) {
    this.selectedCourseBlock = courseBlock;
    this.selectedCourse = '';
    this.selectedClass = null;
    
    if (this.virtualCalendarData) {
      const coursesInBlock = this.virtualCalendarData.data.virtual_calendar
        .filter(item => item.course === courseBlock);

      this.availableCourses = Array.from(
        new Set(coursesInBlock.map(item => JSON.stringify({
          name: item.course_name,
          code: item.details.course_code
        })))
      )
      .map((str: string) => JSON.parse(str))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
    }
  }

  onCourseSelect(courseCode: string) {
    this.selectedCourse = courseCode;
    this.selectedClass = null;

    if (this.virtualCalendarData) {
      const courseClasses = this.virtualCalendarData.data.virtual_calendar
        .filter(item => 
          item.course === this.selectedCourseBlock && 
          item.details.course_code === courseCode
        )
        .map(item => {
          const classMatch = item.details.course_name.match(/\((C\d+)\)$/);
          const className = classMatch ? classMatch[1] : '';
          const lessons = item.details.lessons.split(' ')[0].split(',').map(Number);
          const { startTime, endTime } = this.getLessonTime(lessons);
          
          return {
            className,
            courseName: item.course_name,
            courseCode: item.details.course_code,
            details: item.details,
            base_time: item.base_time,
            schedule: {
              days: item.details.study_days.split(' '),
              lessons,
              location: item.details.study_location,
              teacher: item.details.teacher,
              startTime,
              endTime
            }
          };
        })
        .sort((a, b) => a.className.localeCompare(b.className));

      this.availableClasses = courseClasses;
    }
  }

  onClassSelect(selectedClass: CourseClass) {
    const existingClassForCourse = this.temporarySelectedClasses.find(
      c => c.courseName === selectedClass.courseName
    );

    if (existingClassForCourse) {
      this.temporarySelectedClasses = this.temporarySelectedClasses.filter(
        c => c.courseName !== selectedClass.courseName
      );
    }

    // Check if the class is already selected
    const isAlreadySelected = this.temporarySelectedClasses.some(
      c => c.details.course_name === selectedClass.details.course_name
    );

    if (isAlreadySelected) {
      // If already selected, just remove it (handled by the filter above)
      return;
    }

    // Check for conflicts with other selected classes
    const conflict = this.checkScheduleConflict(selectedClass);
    
    if (conflict) {
      // Show conflict dialog
      this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Cảnh báo trùng lịch',
          message: `Lớp ${selectedClass.details.course_name} trùng lịch với lớp ${conflict.conflictingClass} vào ${conflict.day} (${conflict.startTime} - ${conflict.endTime})`,
          status: 'error',
          confirmText: 'Đóng'
        }
      });

      // Restore the previous class for this course if there are conflicts
      if (existingClassForCourse) {
        this.temporarySelectedClasses.push(existingClassForCourse);
      }
    } else {
      // Add the new class if there are no conflicts
      this.temporarySelectedClasses.push({ ...selectedClass, selected: true });
    }
    this.updateCalendarEvents();
  }

  private checkScheduleConflict(newClass: CourseClass): { conflictingClass: string; day: string; startTime: string; endTime: string } | null {
    // Check conflicts with temporary selections (excluding classes from the same course)
    const otherClasses = this.temporarySelectedClasses.filter(
      c => c.courseCode !== newClass.courseCode
    );
    
    for (const existingClass of otherClasses) {
      // Find common days
      const commonDays = newClass.schedule.days.filter(day => 
        existingClass.schedule.days.includes(day)
      );

      // Check for time conflicts on common days
      for (const day of commonDays) {
        // If they have the same time on a common day, it's a conflict
        if (newClass.schedule.startTime === existingClass.schedule.startTime) {
          return {
            conflictingClass: existingClass.details.course_name,
            day: day,
            startTime: existingClass.schedule.startTime || '',
            endTime: existingClass.schedule.endTime || ''
          };
        }
      }
    }

    return null;
  }

  // Action buttons handlers
  saveSelectedClasses() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Xác nhận lưu',
        message: 'Bạn có chắc chắn muốn lưu các lớp đã chọn không?',
        status: 'info',
        confirmText: 'Lưu',
        cancelText: 'Hủy'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.savedSelectedClasses = [...this.temporarySelectedClasses];
        localStorage.setItem('saved_classes', JSON.stringify(this.savedSelectedClasses));
      }
    });
  }

  clearAllSelections() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Xác nhận xóa',
        message: 'Bạn có chắc chắn muốn xóa tất cả các lớp đã chọn không?',
        status: 'danger',
        confirmText: 'Xóa',
        cancelText: 'Hủy'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.temporarySelectedClasses = [];
        this.updateCalendarEvents();
      }
    });
  }

  private loadSavedClasses() {
    const saved = localStorage.getItem('saved_classes');
    if (saved) {
      this.savedSelectedClasses = JSON.parse(saved);
      this.temporarySelectedClasses = [...this.savedSelectedClasses];
      this.updateCalendarEvents();
    }
  }

  exportToTxt() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Xuất file TXT',
        message: 'Bạn có muốn xuất thời khóa biểu ra file TXT?',
        status: 'info',
        confirmText: 'Xuất',
        cancelText: 'Hủy'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const content = this.temporarySelectedClasses
          .map(classItem => classItem.details.course_name)
          .join('\n');

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'kma_legend.txt';
        link.click();
        window.URL.revokeObjectURL(url);
      }
    });
  }

  importFromTxt() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Nhập từ file TXT',
        message: 'Việc này sẽ xóa tất cả các lớp đã chọn hiện tại và thay thế bằng dữ liệu từ file. Bạn có chắc chắn muốn tiếp tục?',
        status: 'warning',
        confirmText: 'Tiếp tục',
        cancelText: 'Hủy'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt';
        input.onchange = (e: any) => {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = (e) => {
            const content = e.target?.result as string;
            this.processImportedTxt(content);
          };
          reader.readAsText(file);
        };
        input.click();
      }
    });
  }

  private processImportedTxt(content: string) {
    try {
      const courseNames = content.split('\n').filter(name => name.trim());
      const importedClasses: SelectedClass[] = [];

      if (!this.virtualCalendarData) {
        throw new Error('Không có dữ liệu lớp học');
      }

      for (const courseName of courseNames) {
        // Tìm lớp học trong virtualCalendarData
        const matchingClass = this.virtualCalendarData.data.virtual_calendar.find(
          item => item.details.course_name === courseName
        );

        if (matchingClass) {
          const lessons = matchingClass.details.lessons.split(' ')[0].split(',').map(Number);
          const { startTime, endTime } = this.getLessonTime(lessons);

          importedClasses.push({
            courseName: matchingClass.course_name,
            courseCode: matchingClass.details.course_code,
            className: matchingClass.details.course_name.match(/\((C\d+)\)$/)?.[1] || '',
            details: matchingClass.details,
            base_time: matchingClass.base_time,
            schedule: {
              days: matchingClass.details.study_days.split(' '),
              lessons,
              location: matchingClass.details.study_location,
              teacher: matchingClass.details.teacher,
              startTime,
              endTime
            },
            selected: true
          });
        }
      }

      if (importedClasses.length === 0) {
        throw new Error('Không tìm thấy lớp học nào phù hợp');
      }

      // Clear existing selections and replace with imported data
      this.temporarySelectedClasses = importedClasses;
      this.savedSelectedClasses = [...importedClasses];
      localStorage.setItem('saved_classes', JSON.stringify(importedClasses));
      this.updateCalendarEvents();

      // Show success dialog
      this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Thành công',
          message: `Đã nhập thành công ${importedClasses.length} lớp học từ file TXT.`,
          status: 'success',
          confirmText: 'OK'
        }
      });
    } catch (error) {
      // Show error dialog
      this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Lỗi',
          message: error instanceof Error ? error.message : 'Không thể đọc file. Vui lòng kiểm tra định dạng file và thử lại.',
          status: 'error',
          confirmText: 'OK'
        }
      });
    }
  }

  toggleClassTable() {
    this.isClassTableVisible = !this.isClassTableVisible;
  }

  toggleSelectedClasses() {
    this.isSelectedClassesVisible = !this.isSelectedClassesVisible;
  }

  exportToICS() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Xuất file ICS',
        message: 'Bạn có muốn xuất lịch học ra file ICS để nhập vào Google Calendar không?',
        status: 'info',
        confirmText: 'Xuất file',
        cancelText: 'Hủy'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Implementation for ICS export will be added later
        // console.log('ICS export not implemented yet');
      }
    });
  }

  logout() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Xác nhận đăng xuất',
        message: 'Bạn có chắc chắn muốn đăng xuất?',
        status: 'warning',
        confirmText: 'Đăng xuất',
        cancelText: 'Hủy'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        localStorage.removeItem('virtual_calendar_secret');
        this.router.navigate(['/login-virtual-calendar']);
      }
    });
  }

  private handleEventClick(arg: EventClickArg) {
    const event = arg.event;
    const title = event.title.split('\n');
    const dialogRef = this.dialog.open(EventDialogComponent, {
      width: '500px',
      maxWidth: '95vw',
      autoFocus: false,
      panelClass: 'event-dialog-container',
      data: {
        event: {
          title: title[0], // course name
          start: event.start!,
          end: event.end!,
          location: title[2], // location
          teacher: title[1], // teacher
          courseCode: event.extendedProps['courseCode'],
          className: [event.extendedProps['className']]
        },
        formattedDate: event.start!.toLocaleDateString('vi-VN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        formattedTime: `${event.start!.toLocaleTimeString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })} - ${event.end!.toLocaleTimeString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })}`
      }
    });
  }

  private customEventContent(arg: any) {
    const timeText = arg.timeText.split(' - ')[0]; // Chỉ lấy giờ bắt đầu
    const title = arg.event.title.split('\n');
    const location = title[2].split(' ')[0]; // Chỉ lấy số phòng (phần trước dấu cách)
    const courseName = title[0];
    
    // Check if screen width is less than 768px (mobile)
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      return {
        html: `
          <div class="fc-event-content" style="padding: 2px 4px; font-size: 0.9em;">
            <div style="font-weight: bold;">${timeText}</div>
            <div>${location}</div>
          </div>
        `
      };
    } else {
      // Desktop view shows more information
      return {
        html: `
          <div class="fc-event-content" style="padding: 2px 4px; font-size: 0.9em;">
            <div style="font-weight: bold;">${timeText}</div>
            <div>${location}</div>
            <div style="font-size: 0.8em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${courseName}</div>
          </div>
        `
      };
    }
  }

  private updateCalendarEvents() {
    if (!this.temporarySelectedClasses.length) {
      this.calendarOptions.events = [];
      return;
    }

    const events: EventInput[] = [];

    this.temporarySelectedClasses.forEach(classItem => {
      if (!classItem.schedule?.days || !classItem.schedule?.startTime || !classItem.schedule?.endTime) {
        return;
      }

      classItem.schedule.days.forEach(dateStr => {
        const [day, month, year] = dateStr.split('/').map(Number);
        const eventDate = new Date(year, month - 1, day);

        const [startHours, startMinutes] = classItem.schedule!.startTime!.split(':').map(Number);
        const [endHours, endMinutes] = classItem.schedule!.endTime!.split(':').map(Number);

        const startDateTime = new Date(eventDate);
        startDateTime.setHours(startHours, startMinutes);

        const endDateTime = new Date(eventDate);
        endDateTime.setHours(endHours, endMinutes);

        events.push({
          title: `${classItem.details.course_name}\n${classItem.details.teacher}\n${classItem.details.study_location}`,
          start: startDateTime,
          end: endDateTime,
          backgroundColor: this.getRandomColor(classItem.details.course_name),
          borderColor: this.getRandomColor(classItem.details.course_name),
          textColor: '#ffffff',
          extendedProps: {
            courseCode: classItem.courseCode,
            lessons: classItem.schedule.lessons.join(', '),
            className: classItem.className
          }
        });
      });
    });

    if (events.length > 0) {
      this.calendarOptions = {
        ...this.calendarOptions,
        events: events
      };
    } else {
      this.calendarOptions.events = [];
    }
  }

  private getRandomColor(seed: string): string {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
  }
}
