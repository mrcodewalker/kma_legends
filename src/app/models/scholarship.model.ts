export interface ScholarshipStudent {
  id: string | null;
  studentId: string | null;
  studentCode: string;
  studentName: string;
  studentClass: string;
  ranking: number;
  gpa: number;
  asiaGpa: number;
}

export interface CourseFilter {
  value: string;
  viewValue: string;
}

export type CoursePrefix = 'CT' | 'DT' | 'AT';

export interface CourseConfig {
  prefix: CoursePrefix;
  currentNumber: number;
} 