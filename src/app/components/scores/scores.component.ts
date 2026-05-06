import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ScoresService } from '../../services/scores.service';
import { ToastService } from '../../services/toast.service';
import {
  ListScoreResponse,
  ScoreDTO,
  GRADE_CONVERSION,
  SearchHistory,
  SEARCH_HISTORY_KEY
} from '../../models/scores.model';
import { GradeConversionDialogComponent } from './grade-conversion-dialog/grade-conversion-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../shared/confirm-dialog/confirm-dialog.component';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-scores',
  templateUrl: './scores.component.html',
  styleUrls: ['./scores.component.scss'],
  animations: [
    trigger('slideInOut', [
      state('void', style({ transform: 'translateY(-100%)', opacity: 0 })),
      state('*', style({ transform: 'translateY(0)', opacity: 1 })),
      transition('void <=> *', animate('200ms ease-in-out'))
    ])
  ]
})
export class ScoresComponent implements OnInit {
  loggedInStudentCode: string | null = null;

  scoreData: ListScoreResponse | null = null;
  gradeConversion = GRADE_CONVERSION;
  currentSemesterGPA: number = 0;
  overallCPA: number = 0;
  isLoading = false;
  errorMessage: string | null = null;
  completedCredits: number = 0;
  failedSubjects: number = 0;

  scoreForm = new FormGroup({
    studentCode: new FormControl('', [Validators.required, Validators.minLength(3)])
  });

  searchHistory: SearchHistory[] = [];
  showHistory = false;

  constructor(
    private scoresService: ScoresService,
    private dialog: MatDialog,
    private router: Router,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.loadLoggedInStudentCode();
    this.loadSearchHistory();
  }

  private loadLoggedInStudentCode() {
    try {
      const scheduleData = localStorage.getItem('schedule_secret');
      if (scheduleData) {
        const scheduleResponse = JSON.parse(scheduleData);
        if (scheduleResponse?.data?.student_info?.student_code) {
          this.loggedInStudentCode = scheduleResponse.data.student_info.student_code;
        }
      }
    } catch (error) {
      console.error('Error loading student code:', error);
    }
  }

  // ─── Search History ────────────────────────────────────────────────────────

  private loadSearchHistory() {
    try {
      const savedHistory = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (savedHistory) {
        this.searchHistory = JSON.parse(savedHistory).map((item: any) => ({
          ...item,
          searchedAt: new Date(item.searchedAt)
        }));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
      this.searchHistory = [];
    }
  }

  private saveSearchHistory() {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(this.searchHistory));
  }

  private addToSearchHistory(studentCode: string, studentName?: string) {
    const existingIndex = this.searchHistory.findIndex(h => h.studentCode === studentCode);
    const newEntry: SearchHistory = { studentCode, searchedAt: new Date(), studentName };

    if (existingIndex !== -1) {
      this.searchHistory.splice(existingIndex, 1);
    }
    this.searchHistory.unshift(newEntry);
    if (this.searchHistory.length > 10) {
      this.searchHistory.pop();
    }
    this.saveSearchHistory();
  }

  toggleHistory() {
    this.showHistory = !this.showHistory;
  }

  loadFromHistory(studentCode: string) {
    this.scoreForm.patchValue({ studentCode });
    this.loadScores();
    this.showHistory = false;
  }

  clearHistory() {
    this.searchHistory = [];
    this.saveSearchHistory();
    this.showHistory = false;
  }

  // ─── Score Loading ─────────────────────────────────────────────────────────

  loadScores() {
    if (this.scoreForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = null;
    const studentCode = this.scoreForm.get('studentCode')?.value;

    this.scoresService.fetchScores(studentCode || '').subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (!response || !response.studentDTO) {
          this.showNewStudentDialog();
          return;
        }
        this.scoreData = response;
        this.calculateGPAs();
        this.addToSearchHistory(
          this.scoreData!.studentDTO.studentCode,
          this.scoreData!.studentDTO.studentName
        );
      },
      error: (error: any) => {
        console.error('Error loading scores:', error);
        this.isLoading = false;
        if (error?.status === 404) {
          this.showNewStudentDialog();
        } else {
          this.errorMessage = error?.error?.message || 'Không thể tải bảng điểm. Vui lòng thử lại.';
        }
      }
    });
  }

  private showNewStudentDialog() {
    const dialogData: ConfirmDialogData = {
      title: 'Bạn là KMAer mới?',
      message: 'Để đồng bộ hóa thông tin sinh viên của bạn hãy đăng nhập vào chức năng Lịch học và quay lại đây tra điểm nhé.',
      status: 'info',
      confirmText: 'Tới lịch học',
      cancelText: 'Hủy'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: dialogData,
      panelClass: 'new-student-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.router.navigate(['/schedule']);
      }
    });
  }

  // ─── GPA Calculations ─────────────────────────────────────────────────────

  calculateStats() {
    if (!this.scoreData) return;
    let completedCredits = 0, failedSubjects = 0;
    this.scoreData.scoreDTOS.forEach(score => {
      if (this.shouldIncludeInGPA(score.subjectName)) {
        if (!this.isFailedSubject(score.scoreFinal, score.scoreOverall)) completedCredits += score.subjectCredit;
        else failedSubjects++;
      }
    });
    this.completedCredits = completedCredits;
    this.failedSubjects = failedSubjects;
  }

  calculateGPAs() {
    if (!this.scoreData) return;
    let totalCredits = 0, totalPoints = 0;

    this.scoreData.scoreDTOS.forEach(score => {
      if (!this.shouldIncludeInGPA(score.subjectName)) return;
      const grade4 = this.convertTo4Scale(score.scoreOverall);
      const credits = score.subjectCredit;
      if (!this.isFailedSubject(score.scoreFinal, score.scoreOverall)) {
        totalCredits += credits;
        totalPoints += grade4 * credits;
      }
    });

    this.currentSemesterGPA = 0;
    this.overallCPA = totalCredits > 0 ? totalPoints / totalCredits : 0;
    this.calculateStats();
  }

  shouldIncludeInGPA(subjectName: string): boolean {
    const lower = subjectName.toLowerCase();
    return !lower.includes('giáo dục thể chất')
      && !lower.includes('thực hành vật lý')
      && !lower.includes('gdtc')
      && !lower.includes('physical education');
  }

  convertTo4Scale(score10: number): number {
    const grade = GRADE_CONVERSION.find(g => {
      const [min, max] = g.scale10.split(' - ').map(Number);
      return score10 >= min && score10 <= max;
    });
    return grade ? grade.scale4 : 0;
  }

  isFailedSubject(scoreFinal: number, scoreOverall: number): boolean {
    return scoreFinal < 2 || scoreOverall < 4;
  }

  isCurrentSemesterSubject(subjectName: string): boolean {
    return false;
  }

  // ─── Display Helpers ───────────────────────────────────────────────────────

  getLetterGrade(score10: number, scoreFinal?: number): string {
    if (typeof scoreFinal === 'number' && scoreFinal < 2) return 'F';
    const rounded = Math.round(score10 * 10) / 10;
    const grade = GRADE_CONVERSION.find(g => {
      const [min, max] = g.scale10.split(' - ').map(Number);
      return rounded >= min && rounded <= max;
    });
    return grade ? grade.letter : 'F';
  }

  getGradeClass(score: number): string {
    if (typeof score !== 'number' || isNaN(score)) return '';
    const b = 'font-medium ';
    if (score >= 9.0) return b + 'text-green-600';
    if (score >= 8.5) return b + 'text-green-500';
    if (score >= 7.8) return b + 'text-blue-600';
    if (score >= 7.0) return b + 'text-blue-500';
    if (score >= 6.3) return b + 'text-yellow-600';
    if (score >= 5.5) return b + 'text-yellow-500';
    if (score >= 4.8) return b + 'text-orange-500';
    if (score >= 4.0) return b + 'text-orange-600';
    return b + 'text-red-500';
  }

  getScoreClass(score: number, isFinal: boolean = false, scoreOverall: number = 0): string {
    if (typeof score !== 'number' || isNaN(score)) return '';
    const b = 'font-medium ';
    if (isFinal && this.isFailedSubject(score, scoreOverall)) return b + 'text-red-500';
    return this.getGradeClass(score);
  }

  getRowClass(score: ScoreDTO): string {
    return this.isFailedSubject(score.scoreFinal, score.scoreOverall)
      ? 'bg-red-50 hover:bg-red-100 transition duration-150'
      : 'hover:bg-gray-50 transition duration-150';
  }

  formatNumber(num: number): string {
    if (typeof num !== 'number' || isNaN(num)) return '0.00';
    return num.toFixed(2);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('vi-VN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  }

  toggleGradeTable() {
    this.dialog.open(GradeConversionDialogComponent, {
      maxWidth: '100vw',
      width: '100%',
      panelClass: ['grade-conversion-dialog', 'fullscreen-mobile-dialog'],
      autoFocus: false
    });
  }
}
