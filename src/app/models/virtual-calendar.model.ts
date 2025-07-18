export interface VirtualCalendarResponse {
  message: string;
  virtual_calendar: VirtualCalendarItem[];
}

export interface VirtualCalendarItem {
  course: string;  // Course block code (e.g. "CT7")
  course_name: string;  // Main course name (e.g. "Lập trình hợp ngữ (3 TC)")
  details: CourseDetails;
  base_time: string;
}

export interface CourseDetails {
  study_days: string;
  teacher: string;
  course_code: string;
  course_name: string;  // Class section (e.g. "Lập trình hợp ngữ-1-25 (C702)")
  study_location: string;
  lessons: string;
}

export interface CourseClass {
  className: string;  // Class section code (e.g. "C702")
  courseName: string;  // Full course name
  courseCode: string;  // Course code
  details: CourseDetails;  // Original details object
  base_time: string;
  schedule: {
    days: string[];  // Array of dates
    lessons: number[];  // Array of lesson numbers
    location: string;
    teacher: string;
    startTime?: string;  // Format: "HH:mm"
    endTime?: string;    // Format: "HH:mm"
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