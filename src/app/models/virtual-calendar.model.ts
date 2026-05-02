import { StudentInfo } from './schedule.model';

export interface VirtualCalendarResponse {
  code: string;
  message: string;
  data: {
    student_info: StudentInfo;
    virtual_calendar: VirtualCalendarItem[];
  };
}

export interface TimelineResponse {
  course_code: string;
  course_name: string;   // Class section e.g. "LT Java - CT7B (C702)"
  study_location: string;
  teacher: string;
  study_days: string;    // Space-separated dates "14/04/2026 21/04/2026"
  lessons: string;      // Space-separated lesson groups "1,2,3 1,2,3"
}

export interface VirtualCalendarItem {
  course: string;           // Course block e.g. "2024-2025"
  course_name: string;       // Main course name e.g. "Lập trình Java"
  base_time: string;         // Human-readable schedule summary
  details: TimelineResponse;
}

export interface CourseClass {
  className: string;        // Class section code e.g. "C702"
  courseName: string;       // Full course name
  courseCode: string;       // Course code
  details: TimelineResponse; // Raw timeline data
  base_time: string;
  schedule: {
    days: string[];
    lessons: number[];
    location: string;
    teacher: string;
    startTime?: string;
    endTime?: string;
  };
}

export interface ScheduleConflict {
  className: string;
  conflictingClass: string;
  day: string;
  lessons: number[];
}

export interface LessonTime {
  startTime: string;
  endTime: string;
}

export interface SelectedClass extends CourseClass {
  selected: boolean;
}
