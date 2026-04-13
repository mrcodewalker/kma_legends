export interface StudentInfo {
  display_name: string;
  student_code: string;
  gender: string;
  birthday: string;
  birth_place: string;
  id_card: string;
  bank_account: string;
  enroll_semester: string;
  phone: string;
  email: string;
}

export interface StudentDTO {
  studentCode: string;
  studentName: string; // masked: N* V* A*
  studentClass: string;
}

export interface ScoreDTO {
  scoreText: string;
  scoreFirst: number;
  scoreSecond: number;
  scoreFinal: number;
  scoreOverall: number;
  subjectName: string; // masked: giữ 3 ký tự đầu
  subjectCredit: number;
}

export interface ListScoreResponse {
  studentDTO: StudentDTO;
  scoreDTOS: ScoreDTO[];
}

export interface VirtualScore {
  scoreText: string;
  scoreFirst: number;
  scoreSecond: number;
  scoreFinal: number;
  scoreOverall: number;
  subjectName: string;
  subjectCredit: number;
  isSelected: boolean;
}

// Score Batch (bảng điểm ảo lưu server)
export interface ScoreBatchRequest {
  studentInfo: {
    studentCode: string;
    studentName: string;
    studentClass: string;
  };
  scores: VirtualScore[];
  lastUpdated?: string; // ISO 8601
}

export interface ScoreBatch {
  batchId: number;
  studentCode: string;
  studentName: string;
  studentClass: string;
  lastUpdated: string;
  scoreItems: (VirtualScore & { itemId: number })[];
}

// Response từ endpoint /score-batch/student/encrypted
export interface EncryptedScoreBatchResponse {
  student_info: StudentInfo;
  score_batch: ScoreBatch;
}

export interface VirtualScoreTable {
  studentInfo: {
    studentCode: string;
    studentName: string;
    studentClass: string;
  };
  scores: VirtualScore[];
  lastUpdated: Date;
}

export interface GradeConversion {
  classification: string;
  scale10: string;
  scale4: number;
  letter: string;
}

export const GRADE_CONVERSION: GradeConversion[] = [
  { classification: 'Xuất sắc', scale10: '9.0 - 10.0', scale4: 4.0, letter: 'A+' },
  { classification: 'Giỏi', scale10: '8.5 - 8.9', scale4: 3.8, letter: 'A' },
  { classification: 'Khá', scale10: '7.8 - 8.4', scale4: 3.5, letter: 'B+' },
  { classification: 'Khá', scale10: '7.0 - 7.7', scale4: 3.0, letter: 'B' },
  { classification: 'Trung bình', scale10: '6.3 - 6.9', scale4: 2.4, letter: 'C+' },
  { classification: 'Trung bình', scale10: '5.5 - 6.2', scale4: 2.0, letter: 'C' },
  { classification: 'Trung bình yếu', scale10: '4.8 - 5.4', scale4: 1.5, letter: 'D+' },
  { classification: 'Trung bình yếu', scale10: '4.0 - 4.7', scale4: 1.0, letter: 'D' },
  { classification: 'Kém', scale10: '0.0 - 3.9', scale4: 0.0, letter: 'F' }
];

export interface CPACalculation {
  targetCPA: number;
  remainingCredits: number;
  requiredGPA: number;
}

export interface ProgramInfo {
  code: string;
  totalCredits: number;
  name: string;
}

export const PROGRAM_CREDITS: ProgramInfo[] = [
  { code: 'CT', totalCredits: 176, name: 'Công nghệ thông tin' },
  { code: 'AT', totalCredits: 153, name: 'An toàn thông tin' },
  { code: 'DT', totalCredits: 169, name: 'Điện tử viễn thông' }
];

export interface SearchHistory {
  studentCode: string;
  searchedAt: Date;
  studentName?: string;
}

export const SEARCH_HISTORY_KEY = 'scores_search_history'; 