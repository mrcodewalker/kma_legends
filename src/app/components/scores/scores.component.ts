import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ScoresService } from '../../services/scores.service';
import { 
  ListScoreResponse, 
  ScoreDTO, 
  GRADE_CONVERSION,
  GradeConversion,
  VirtualScore,
  VirtualScoreTable,
  PROGRAM_CREDITS,
  SearchHistory,
  SEARCH_HISTORY_KEY
} from '../../models/scores.model';
import { CPACalculatorDialogComponent } from './cpa-calculator-dialog/cpa-calculator-dialog.component';
import { GradeConversionDialogComponent } from './grade-conversion-dialog/grade-conversion-dialog.component';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-scores',
  templateUrl: './scores.component.html',
  styleUrls: ['./scores.component.scss'],
  animations: [
    trigger('slideInOut', [
      state('void', style({
        transform: 'translateY(-100%)',
        opacity: 0
      })),
      state('*', style({
        transform: 'translateY(0)',
        opacity: 1
      })),
      transition('void <=> *', animate('200ms ease-in-out'))
    ])
  ]
})
export class ScoresComponent implements OnInit {
  @ViewChild('newSubjectRow') newSubjectRow: ElementRef | null = null;
  private readonly VIRTUAL_SCORES_KEY = 'virtualScoresTable';
  loggedInStudentCode: string | null = null;
  
  scoreData: ListScoreResponse | null = null;
  virtualTable: VirtualScoreTable | null = null;
  gradeConversion = GRADE_CONVERSION;
  showGradeTable = false;
  showVirtualTable = false;
  currentSemesterGPA: number = 0;
  overallCPA: number = 0;
  virtualGPA: number = 0;
  isLoading = false;
  errorMessage: string | null = null;
  editingCell: { rowIndex: number; column: string } | null = null;
  completedCredits: number = 0;
  failedSubjects: number = 0;
  
  scoreForm = new FormGroup({
    studentCode: new FormControl('', [Validators.required, Validators.minLength(3)])
  });

  displayedColumns: string[] = [
    'subjectName',
    'subjectCredit',
    'scoreFirst',
    'scoreSecond',
    'scoreFinal',
    'scoreOverall',
    'grade',
    'isCurrentSemester'
  ];

  searchHistory: SearchHistory[] = [];
  showHistory = false;

  constructor(
    private scoresService: ScoresService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadVirtualTableFromStorage();
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

  handleVirtualTableAccess() {
    if (!this.loggedInStudentCode) {
      // Nếu chưa đăng nhập, chuyển đến trang login
      this.router.navigate(['/login'], { 
        queryParams: { 
          returnUrl: '/scores',
          message: 'Vui lòng đăng nhập để sử dụng tính năng bảng điểm ảo'
        }
      });
    } else if (this.scoreData && this.scoreData.listScoreDTO.studentDTO.studentCode !== this.loggedInStudentCode) {
      // Nếu đã đăng nhập nhưng đang xem điểm của người khác
      this.scoreForm.patchValue({ studentCode: this.loggedInStudentCode });
      this.loadScores();
    }
  }

  isVirtualTableEnabled(): boolean {
    return !!this.scoreData && !!this.loggedInStudentCode && 
           this.scoreData.listScoreDTO.studentDTO.studentCode === this.loggedInStudentCode;
  }

  isLoggedInOrCorrectStudent(): boolean {
    if (!this.scoreData || !this.loggedInStudentCode) return false;
    return this.scoreData.listScoreDTO.studentDTO.studentCode === this.loggedInStudentCode;
  }

  loadVirtualTableFromStorage() {
    const savedTable = localStorage.getItem(this.VIRTUAL_SCORES_KEY);
    if (savedTable) {
      try {
        const parsedTable = JSON.parse(savedTable) as VirtualScoreTable;
        if (parsedTable && parsedTable.lastUpdated) {
          this.virtualTable = {
            ...parsedTable,
            lastUpdated: new Date(parsedTable.lastUpdated)
          };
          this.calculateVirtualGPA();
        }
      } catch (error) {
        console.error('Error parsing virtual table:', error);
        this.virtualTable = null;
      }
    }
  }

  saveVirtualTableToStorage() {
    if (this.virtualTable) {
      localStorage.setItem(this.VIRTUAL_SCORES_KEY, JSON.stringify(this.virtualTable));
    }
  }

  createVirtualTable() {
    if (!this.scoreData) return;

    this.virtualTable = {
      studentInfo: { ...this.scoreData.listScoreDTO.studentDTO },
      scores: this.scoreData.listScoreDTO.scoreDTOS.map(score => ({
        scoreText: score.scoreText,
        scoreFirst: score.scoreFirst,
        scoreSecond: score.scoreSecond,
        scoreFinal: score.scoreFinal,
        scoreOverall: score.scoreOverall,
        subjectName: score.subjectName,
        subjectCredit: score.subjectCredit,
        isSelected: false
      })),
      lastUpdated: new Date()
    };

    this.saveVirtualTableToStorage();
    this.showVirtualTable = true;
  }

  resetVirtualTable() {
    if (!this.scoreData) return;
    this.createVirtualTable();
  }

  clearVirtualTable() {
    localStorage.removeItem(this.VIRTUAL_SCORES_KEY);
    this.virtualTable = null;
    this.showVirtualTable = false;
  }

  selectAllSubjects() {
    if (!this.virtualTable) return;
    
    const allSelected = this.virtualTable.scores.every(score => score.isSelected);
    this.virtualTable.scores.forEach(score => {
      score.isSelected = !allSelected;
    });
    
    this.saveVirtualTableToStorage();
    this.calculateVirtualGPA();
  }

  areAllSubjectsSelected(): boolean {
    if (!this.virtualTable) return false;
    return this.virtualTable.scores.every(score => score.isSelected);
  }

  addNewSubject() {
    if (!this.virtualTable) return;

    const newScore: VirtualScore = {
      scoreText: '',
      scoreFirst: 0,
      scoreSecond: 0,
      scoreFinal: 0,
      scoreOverall: 0,
      subjectName: 'Môn học mới',
      subjectCredit: 0,
      isSelected: false
    };

    this.virtualTable.scores.push(newScore);
    this.saveVirtualTableToStorage();
    
    // Đợi DOM cập nhật và scroll đến môn học mới
    setTimeout(() => {
      const virtualTableContainer = document.querySelector('.virtual-table-container');
      if (virtualTableContainer) {
        virtualTableContainer.scrollTo({
          top: virtualTableContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
  }

  removeSubject(index: number) {
    if (!this.virtualTable) return;
    this.virtualTable.scores.splice(index, 1);
    this.saveVirtualTableToStorage();
    this.calculateVirtualGPA();
  }

  toggleSubjectSelection(index: number) {
    if (!this.virtualTable) return;
    this.virtualTable.scores[index].isSelected = !this.virtualTable.scores[index].isSelected;
    this.saveVirtualTableToStorage();
    this.calculateVirtualGPA();
  }

  startEditing(rowIndex: number, column: string) {
    this.editingCell = { rowIndex, column };
  }

  finishEditing(event: any, rowIndex: number, column: string) {
    if (!this.virtualTable) return;
    
    const value = Number(event.target.value);
    const score = this.virtualTable.scores[rowIndex];

    switch (column) {
      case 'subjectName':
        score.subjectName = event.target.value;
        break;
      case 'subjectCredit':
        score.subjectCredit = Math.max(0, Math.min(10, value));
        break;
      case 'scoreFirst':
        score.scoreFirst = Math.max(0, Math.min(10, value));
        this.calculateOverallScore(score);
        break;
      case 'scoreSecond':
        score.scoreSecond = Math.max(0, Math.min(10, value));
        this.calculateOverallScore(score);
        break;
      case 'scoreFinal':
        score.scoreFinal = Math.max(0, Math.min(10, value));
        this.calculateOverallScore(score);
        break;
    }

    this.editingCell = null;
    this.saveVirtualTableToStorage();
    this.calculateVirtualGPA();
  }

  calculateOverallScore(score: VirtualScore) {
    if (!score) return;
    
    const tp1 = typeof score.scoreFirst === 'number' ? score.scoreFirst : 0;  // Điểm GK
    const tp2 = typeof score.scoreSecond === 'number' ? score.scoreSecond : 0;  // Điểm Chuyên Cần
    const scoreFinal = typeof score.scoreFinal === 'number' ? score.scoreFinal : 0;  // Điểm CK
    
    // Calculate overall score using the formula: (TP1*0.7 + 0.3*TP2)*0.3 + CK*0.7
    const processComponent = (tp1 * 0.7 + tp2 * 0.3) * 0.3;
    const finalComponent = scoreFinal * 0.7;
    // Round to 1 decimal place
    score.scoreOverall = Math.round((processComponent + finalComponent) * 10) / 10;
    
    this.calculateVirtualGPA();
  }

  shouldIncludeInGPA(subjectName: string): boolean {
    const lowerName = subjectName.toLowerCase();
    return !lowerName.includes('giáo dục thể chất') && 
           !lowerName.includes('thực hành vật lý') &&
           !lowerName.includes('gdtc') &&
           !lowerName.includes('physical education');
  }

  calculateVirtualGPA() {
    if (!this.virtualTable) return;

    let totalCredits = 0;
    let totalPoints = 0;

    this.virtualTable.scores.forEach(score => {
      if (score.isSelected && this.shouldIncludeInGPA(score.subjectName)) {
        const grade4 = this.convertTo4Scale(score.scoreOverall);
        totalCredits += score.subjectCredit;
        totalPoints += grade4 * score.subjectCredit;
      }
    });

    this.virtualGPA = totalCredits > 0 ? totalPoints / totalCredits : 0;
  }

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
    const newEntry: SearchHistory = {
      studentCode,
      searchedAt: new Date(),
      studentName
    };

    if (existingIndex !== -1) {
      // Move to top if exists
      this.searchHistory.splice(existingIndex, 1);
    }

    this.searchHistory.unshift(newEntry);

    // Keep only last 10 entries
    if (this.searchHistory.length > 10) {
      this.searchHistory.pop();
    }

    this.saveSearchHistory();
  }

  loadScores() {
    if (this.scoreForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    const studentCode = this.scoreForm.get('studentCode')?.value;

    this.scoresService.fetchScores({ studentCode: studentCode || '' }).subscribe({
      next: (response: any) => {
        this.scoreData = response;
        this.calculateGPAs();
        this.isLoading = false;
        // Add to search history after successful load
        if (this.scoreData?.listScoreDTO?.studentDTO) {
          this.addToSearchHistory(
            this.scoreData.listScoreDTO.studentDTO.studentCode,
            this.scoreData.listScoreDTO.studentDTO.studentName
          );
        }
      },
      error: (error: any) => {
        console.error('Error loading scores:', error);
        this.errorMessage = 'Không thể tải điểm. Vui lòng kiểm tra mã sinh viên và thử lại.';
        this.isLoading = false;
      }
    });
  }

  calculateStats() {
    if (!this.scoreData) return;

    let completedCredits = 0;
    let failedSubjects = 0;

    this.scoreData.listScoreDTO.scoreDTOS.forEach(score => {
      if (this.shouldIncludeInGPA(score.subjectName)) {
        if (!this.isFailedSubject(score.scoreFinal, score.scoreOverall)) {
          completedCredits += score.subjectCredit;
        } else {
          failedSubjects++;
        }
      }
    });

    this.completedCredits = completedCredits;
    this.failedSubjects = failedSubjects;
  }

  calculateGPAs() {
    if (!this.scoreData) return;

    let currentSemesterCredits = 0;
    let currentSemesterPoints = 0;
    let totalCredits = 0;
    let totalPoints = 0;

    // Get current semester subjects names
    const currentSemesterSubjectNames = new Set(
      this.scoreData.subjectDTOS.map(subject => subject.subjectName.trim().toLowerCase())
    );

    this.scoreData.listScoreDTO.scoreDTOS.forEach(score => {
      if (!this.shouldIncludeInGPA(score.subjectName)) return;

      const grade4 = this.convertTo4Scale(score.scoreOverall);
      const credits = score.subjectCredit;

      if (currentSemesterSubjectNames.has(score.subjectName.trim().toLowerCase())) {
        currentSemesterCredits += credits;
        currentSemesterPoints += grade4 * credits;
      }

      if (!this.isFailedSubject(score.scoreFinal, score.scoreOverall)) {
        totalCredits += credits;
        totalPoints += grade4 * credits;
      }
    });

    this.currentSemesterGPA = currentSemesterCredits > 0 
      ? currentSemesterPoints / currentSemesterCredits 
      : 0;
    
    this.overallCPA = totalCredits > 0 
      ? totalPoints / totalCredits 
      : 0;

    this.calculateStats();
  }

  convertTo4Scale(score10: number): number {
    const grade = GRADE_CONVERSION.find(g => {
      const [min, max] = g.scale10.split(' - ').map(Number);
      return score10 >= min && score10 <= max;
    });
    return grade ? grade.scale4 : 0;
  }

  isFailedSubject(scoreFinal: number, scoreOverall: number): boolean {
    // Điều kiện trượt:
    // 1. Điểm thi < 2 HOẶC
    // 2. Điểm tổng kết < 4
    return scoreFinal < 2 || scoreOverall < 4;
  }

  getLetterGrade(score10: number, scoreFinal?: number): string {
    // Nếu điểm thi < 2, luôn trả về F bất kể điểm tổng kết
    if (typeof scoreFinal === 'number' && scoreFinal < 2) {
      return 'F';
    }

    // Round to 1 decimal place before comparison
    const roundedScore = Math.round(score10 * 10) / 10;
    const grade = GRADE_CONVERSION.find(g => {
      const [min, max] = g.scale10.split(' - ').map(Number);
      return roundedScore >= min && roundedScore <= max;
    });
    return grade ? grade.letter : 'F';
  }

  getGradeClass(score: number): string {
    if (typeof score !== 'number' || isNaN(score)) return '';
    
    const baseClasses = 'font-medium ';
    
    if (score >= 9.0) return baseClasses + 'text-green-600';
    if (score >= 8.5) return baseClasses + 'text-green-500';
    if (score >= 7.8) return baseClasses + 'text-blue-600';
    if (score >= 7.0) return baseClasses + 'text-blue-500';
    if (score >= 6.3) return baseClasses + 'text-yellow-600';
    if (score >= 5.5) return baseClasses + 'text-yellow-500';
    if (score >= 4.8) return baseClasses + 'text-orange-500';
    if (score >= 4.0) return baseClasses + 'text-orange-600';
    return baseClasses + 'text-red-500';
  }

  isCurrentSemesterSubject(subjectName: string): boolean {
    if (!this.scoreData) return false;
    return this.scoreData.subjectDTOS.some(
      subject => subject.subjectName.trim().toLowerCase() === subjectName.trim().toLowerCase()
    );
  }

  toggleGradeTable() {
    this.dialog.open(GradeConversionDialogComponent, {
      maxWidth: '100vw',
      width: '100%',
      panelClass: ['grade-conversion-dialog', 'fullscreen-mobile-dialog'],
      autoFocus: false
    });
  }

  toggleVirtualTable() {
    this.handleVirtualTableAccess();
    if (!this.isVirtualTableEnabled()) {
      this.errorMessage = 'Bảng điểm ảo chỉ khả dụng cho mã sinh viên đã đăng nhập xem lịch học.';
      return;
    }
    this.showVirtualTable = !this.showVirtualTable;
    if (this.showVirtualTable && !this.virtualTable && this.scoreData) {
      this.createVirtualTable();
    }

    // Scroll to top when switching tables
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  formatNumber(num: number): string {
    if (typeof num !== 'number' || isNaN(num)) return '0.00';
    return num.toFixed(2);
  }

  parseFloat(value: string | number): number {
    const parsed = typeof value === 'string' ? Number(value) : value;
    if (isNaN(parsed)) return 0;
    // Ensure the value is between 0 and 10 with 1 decimal place
    return Math.min(10, Math.max(0, Math.round(parsed * 10) / 10));
  }

  handleEnterKey(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target) {
      target.blur();
    }
  }

  getScoreClass(score: number, isFinal: boolean = false, scoreOverall: number = 0): string {
    if (typeof score !== 'number' || isNaN(score)) return '';
    
    const baseClasses = 'font-medium ';
    
    if (isFinal && this.isFailedSubject(score, scoreOverall)) {
      return baseClasses + 'text-red-500';
    }
    
    if (score >= 9.0) return baseClasses + 'text-green-600';
    if (score >= 8.5) return baseClasses + 'text-green-500';
    if (score >= 7.8) return baseClasses + 'text-blue-600';
    if (score >= 7.0) return baseClasses + 'text-blue-500';
    if (score >= 6.3) return baseClasses + 'text-yellow-600';
    if (score >= 5.5) return baseClasses + 'text-yellow-500';
    if (score >= 4.8) return baseClasses + 'text-orange-500';
    if (score >= 4.0) return baseClasses + 'text-orange-600';
    return baseClasses + 'text-red-500';
  }

  getRowClass(score: ScoreDTO | VirtualScore): string {
    if (this.isFailedSubject(score.scoreFinal, score.scoreOverall)) {
      return 'bg-red-50 hover:bg-red-100 transition duration-150';
    }
    return 'hover:bg-gray-50 transition duration-150';
  }

  openCPACalculator() {
    if (!this.scoreData) return;

    this.dialog.open(CPACalculatorDialogComponent, {
      width: '800px',
      data: {
        studentCode: this.scoreData.listScoreDTO.studentDTO.studentCode,
        currentCPA: this.overallCPA,
        completedCredits: this.completedCredits,
        failedSubjects: this.failedSubjects
      }
    });
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

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
