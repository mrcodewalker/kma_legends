export interface StudentInfo {
  birthday: string;
  gender: string;
  student_code: string;
  display_name: string;
}

export interface CourseSchedule {
  study_days: string;
  teacher: string;
  course_code: string;
  course_name: string;
  study_location: string;
  lessons: string;
}

export interface ScheduleResponse {
  code: string;
  data: {
    student_info: StudentInfo;
    student_schedule: CourseSchedule[];
  };
  message: string;
}

export interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  location: string;
  teacher: string;
  courseCode: string;
  className?: string[];
} 