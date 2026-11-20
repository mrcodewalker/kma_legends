export interface StudentInfo {
  birthday: string;
  gender: string;
  student_code: string;
  display_name: string;
  phone?: string;
  id_card?: string;
  birth_place?: string;
  enroll_semester?: string;
  email?: string;
  bank_account?: string;
}

export interface CourseSchedule {
  study_days: string;
  teacher: string;
  course_code: string;
  course_name: string;
  study_location: string;
  lessons: string;
}

export interface SavedSchedule {
  id: number;
  label: string;
  course_count: number;
  created_at?: string | null;
  updated_at?: string | null;
  is_live?: boolean;
  schedule: CourseSchedule[];
}

export interface ScheduleResponse {
  code: string;
  data: {
    student_info: StudentInfo;
    student_schedule: CourseSchedule[];
    saved_schedules?: SavedSchedule[];
    schedule_is_cached?: boolean;
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
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
} 