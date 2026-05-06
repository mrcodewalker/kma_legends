import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../../services/toast.service';
import { ScoresService } from '../../services/scores.service';
import {
  StudentInfo,
  GRADE_CONVERSION,
  VirtualScore,
  VirtualScoreTable,
} from '../../models/scores.model';
import { UnsavedChangesDialogComponent, UnsavedChangesDialogData } from '../scores/unsaved-changes-dialog/unsaved-changes-dialog.component';
import { VirtualCPACalculatorDialogComponent, VirtualCPACalculatorData } from '../scores/virtual-cpa-calculator-dialog/virtual-cpa-calculator-dialog.component';
import { ImportScoresDialogComponent, ImportScoresDialogData } from '../scores/import-scores-dialog/import-scores-dialog.component';
import { VirtualScoresStatsDialogComponent, VirtualScoresStatsData } from './virtual-scores-stats-dialog/virtual-scores-stats-dialog.component';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-virtual-scores',
  templateUrl: './virtual-scores.component.html',
  styleUrls: ['./virtual-scores.component.scss'],
  animations: [
    trigger('fadeSlideIn', [
      state('void', style({ opacity: 0, transform: 'translateY(16px)' })),
      transition(':enter', [animate('300ms ease-out')]),
    ])
  ]
})
export class VirtualScoresComponent implements OnInit {
  private readonly VIRTUAL_SCORES_KEY = 'virtualScoresTable';

  // Auth state
  loggedInStudentCode: string | null = null;
  loggedInStudentName: string | null = null;
  isLoggedIn = false;

  // Data state
  studentInfo: StudentInfo | null = null;
  virtualTable: VirtualScoreTable | null = null;
  isLoadingVirtualTable = false;
  isSavingVirtualTable = false;
  hasUnsavedChanges = false;
  isDataLoadedFromServer = false;
  errorMessage: string | null = null;

  // GPA stats
  virtualGPA = 0;
  totalAccumulatedCredits = 0;
  virtualTableCPA = 0;
  virtualTableCompletedCredits = 0;
  virtualTableFailedSubjects = 0;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private toastService: ToastService,
    private scoresService: ScoresService
  ) {}

  ngOnInit(): void {
    this.loadLoggedInInfo();
    if (!this.isLoggedIn) {
      return; // template will show login-required screen
    }
    this.setupBeforeUnloadListener();
    this.loadVirtualTableFromServer();
  }

  // ─── Auth ────────────────────────────────────────────────────────────────────

  private loadLoggedInInfo(): void {
    try {
      const raw = localStorage.getItem('schedule_secret');
      if (raw) {
        const parsed = JSON.parse(raw);
        const info = parsed?.data?.student_info;
        if (info?.student_code) {
          this.loggedInStudentCode = info.student_code;
          this.loggedInStudentName = info.display_name ?? info.student_name ?? null;
          this.isLoggedIn = true;
        }
      }
    } catch {
      this.isLoggedIn = false;
    }
  }

  goToLogin(): void {
    this.router.navigate(['/schedule'], {
      queryParams: { message: 'Vui lòng đăng nhập để sử dụng bảng điểm ảo' }
    });
  }

  // ─── Load / Save ─────────────────────────────────────────────────────────────

  private setupBeforeUnloadListener(): void {
    window.addEventListener('beforeunload', (event) => {
      if (this.hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = 'Bạn có thay đổi chưa được lưu lên server. Bạn có chắc muốn thoát?';
      }
    });
  }

  async loadVirtualTableFromServer(): Promise<void> {
    if (!this.loggedInStudentCode) return;

    this.isLoadingVirtualTable = true;
    this.errorMessage = null;

    try {
      const serverRaw: any = await this.scoresService
        .getVirtualScoresEncrypted(this.loggedInStudentCode)
        .toPromise();

      if (serverRaw?.student_info) {
        this.studentInfo = serverRaw.student_info;
      }

      const batch = serverRaw?.score_batch;
      const serverScores = batch?.scoreItems;

      if (Array.isArray(serverScores) && serverScores.length > 0) {
        const normalizedScores = serverScores.map((item: any) => ({
          scoreText: item.scoreText ?? '',
          scoreFirst: Number(item.scoreFirst) || 0,
          scoreSecond: Number(item.scoreSecond) || 0,
          scoreFinal: Number(item.scoreFinal) || 0,
          scoreOverall: Number(item.scoreOverall) || 0,
          subjectName: item.subjectName ?? '',
          subjectCredit: Number(item.subjectCredit) || 0,
          isSelected: Boolean(item.isSelected)
        }));

        this.virtualTable = {
          studentInfo: {
            studentCode: batch?.studentCode ?? this.loggedInStudentCode,
            studentName: batch?.studentName ?? '',
            studentClass: batch?.studentClass ?? ''
          },
          scores: normalizedScores,
          lastUpdated: new Date(batch?.lastUpdated ?? Date.now())
        };

        this.calculateVirtualGPA();
        this.isDataLoadedFromServer = true;
        this.markAsSaved();
      } else {
        // No data on server → restore from official scores
        await this.restoreFromOfficialScores();
      }
    } catch (err) {
      console.error('Error loading virtual table:', err);
      this.errorMessage = 'Không thể tải dữ liệu từ server. Vui lòng thử lại.';
      this.isDataLoadedFromServer = false;
    } finally {
      this.isLoadingVirtualTable = false;
    }
  }

  private async restoreFromOfficialScores(): Promise<void> {
    if (!this.loggedInStudentCode) return;
    try {
      const response: any = await this.scoresService
        .restoreScores(this.loggedInStudentCode)
        .toPromise();

      const scoreDTOS = response?.scoreDTOS ?? response?.listScoreDTO?.scoreDTOS ?? [];
      const studentDTO = response?.studentDTO ?? response?.listScoreDTO?.studentDTO;

      if (scoreDTOS.length > 0) {
        this.virtualTable = {
          studentInfo: {
            studentCode: studentDTO?.studentCode ?? this.loggedInStudentCode!,
            studentName: studentDTO?.studentName ?? this.loggedInStudentName ?? '',
            studentClass: studentDTO?.studentClass ?? ''
          },
          scores: scoreDTOS.map((s: any) => ({
            scoreText: s.scoreText ?? '',
            scoreFirst: Number(s.scoreFirst) || 0,
            scoreSecond: Number(s.scoreSecond) || 0,
            scoreFinal: Number(s.scoreFinal) || 0,
            scoreOverall: Number(s.scoreOverall) || 0,
            subjectName: s.subjectName ?? '',
            subjectCredit: Number(s.subjectCredit) || 0,
            isSelected: true
          })),
          lastUpdated: new Date()
        };
        this.calculateVirtualGPA();
        this.markAsChanged(); // Has unsaved data (new restore)
      } else {
        this.virtualTable = null;
      }
    } catch {
      this.virtualTable = null;
    }
  }

  saveVirtualTableToServer(): void {
    if (!this.virtualTable || !this.loggedInStudentCode) return;

    this.isSavingVirtualTable = true;
    this.errorMessage = null;

    this.scoresService.saveVirtualScores(this.virtualTable).subscribe({
      next: () => {
        this.isSavingVirtualTable = false;
        this.markAsSaved();
        localStorage.setItem(this.VIRTUAL_SCORES_KEY, JSON.stringify(this.virtualTable));
        this.toastService.success('Đã lưu bảng điểm ảo lên server thành công!', 4000);
      },
      error: (err) => {
        console.error('Error saving virtual table:', err);
        this.isSavingVirtualTable = false;
        localStorage.setItem(this.VIRTUAL_SCORES_KEY, JSON.stringify(this.virtualTable));
        this.toastService.error('Không thể lưu lên server. Dữ liệu đã được lưu cục bộ.', 5000);
      }
    });
  }

  resetVirtualTable(): void {
    if (!this.loggedInStudentCode) return;

    this.toastService.info('Đang lấy dữ liệu từ server...', 2000);

    this.scoresService.restoreScores(this.loggedInStudentCode).subscribe({
      next: (response: any) => {
        const scoreDTOS = response?.scoreDTOS ?? response?.listScoreDTO?.scoreDTOS ?? [];
        const studentDTO = response?.studentDTO ?? response?.listScoreDTO?.studentDTO;

        if (!scoreDTOS.length) {
          this.toastService.error('Không có dữ liệu để khôi phục', 3000);
          return;
        }

        this.virtualTable = {
          studentInfo: {
            studentCode: studentDTO?.studentCode ?? this.loggedInStudentCode!,
            studentName: studentDTO?.studentName ?? '',
            studentClass: studentDTO?.studentClass ?? ''
          },
          scores: scoreDTOS.map((s: any) => ({
            scoreText: s.scoreText ?? '',
            scoreFirst: Number(s.scoreFirst) || 0,
            scoreSecond: Number(s.scoreSecond) || 0,
            scoreFinal: Number(s.scoreFinal) || 0,
            scoreOverall: Number(s.scoreOverall) || 0,
            subjectName: s.subjectName ?? '',
            subjectCredit: Number(s.subjectCredit) || 0,
            isSelected: true
          })),
          lastUpdated: new Date()
        };

        this.calculateVirtualGPA();
        this.markAsChanged();
        this.toastService.success('Đã khôi phục dữ liệu từ server', 3000);
      },
      error: () => {
        this.toastService.error('Không thể lấy dữ liệu khôi phục từ server', 4000);
      }
    });
  }

  // ─── GPA Calculations ─────────────────────────────────────────────────────────

  shouldIncludeInGPA(subjectName: string): boolean {
    const lower = subjectName.toLowerCase();
    return !lower.includes('giáo dục thể chất')
      && !lower.includes('thực hành vật lý')
      && !lower.includes('gdtc')
      && !lower.includes('physical education');
  }

  calculateOverallScore(score: VirtualScore): void {
    const tp1 = Number(score.scoreFirst) || 0;
    const tp2 = Number(score.scoreSecond) || 0;
    const fin = Number(score.scoreFinal) || 0;
    const process = (tp1 * 0.7 + tp2 * 0.3) * 0.3;
    score.scoreOverall = Math.round((process + fin * 0.7) * 10) / 10;
    this.calculateVirtualGPA();
  }

  calculateVirtualGPA(): void {
    if (!this.virtualTable) return;

    let totalCredits = 0, totalPoints = 0, accumulatedCredits = 0;

    this.virtualTable.scores.forEach(score => {
      if (score.isSelected) {
        accumulatedCredits += score.subjectCredit;
        if (this.shouldIncludeInGPA(score.subjectName)) {
          const g4 = this.convertTo4Scale(score.scoreOverall);
          totalCredits += score.subjectCredit;
          totalPoints += g4 * score.subjectCredit;
        }
      }
    });

    this.virtualGPA = totalCredits > 0 ? totalPoints / totalCredits : 0;
    this.totalAccumulatedCredits = accumulatedCredits;
    this.calculateVirtualTableStats();
  }

  calculateVirtualTableStats(): void {
    if (!this.virtualTable) {
      this.virtualTableCPA = 0;
      this.virtualTableCompletedCredits = 0;
      this.virtualTableFailedSubjects = 0;
      return;
    }

    let completed = 0, failed = 0, credits = 0, points = 0;

    this.virtualTable.scores.forEach(score => {
      if (score.isSelected && this.shouldIncludeInGPA(score.subjectName)) {
        if (this.isFailedSubject(score.scoreFinal, score.scoreOverall)) {
          failed++;
        } else {
          const g4 = this.convertTo4Scale(score.scoreOverall);
          completed += score.subjectCredit;
          credits += score.subjectCredit;
          points += g4 * score.subjectCredit;
        }
      }
    });

    this.virtualTableCompletedCredits = completed;
    this.virtualTableFailedSubjects = failed;
    this.virtualTableCPA = credits > 0 ? points / credits : 0;
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

  // ─── Virtual Table Actions ────────────────────────────────────────────────────

  selectAllSubjects(): void {
    if (!this.virtualTable) return;
    const allSelected = this.virtualTable.scores.every(s => s.isSelected);
    this.virtualTable.scores.forEach(s => s.isSelected = !allSelected);
    this.markAsChanged();
    this.calculateVirtualGPA();
  }

  areAllSubjectsSelected(): boolean {
    return !!this.virtualTable && this.virtualTable.scores.every(s => s.isSelected);
  }

  addNewSubject(): void {
    if (!this.virtualTable) return;
    this.virtualTable.scores.push({
      scoreText: '',
      scoreFirst: 0, scoreSecond: 0, scoreFinal: 0, scoreOverall: 0,
      subjectName: 'Môn học mới', subjectCredit: 0, isSelected: false
    });
    this.markAsChanged();
    setTimeout(() => {
      const el = document.querySelector('.virtual-table-container');
      el?.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }, 100);
  }

  removeSubject(index: number): void {
    if (!this.virtualTable) return;
    const subjectName = this.virtualTable.scores[index]?.subjectName || 'môn học này';
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      disableClose: true,
      data: { 
        title: 'Xóa môn học',
        message: `Bạn có chắc chắn muốn xóa môn "${subjectName}" khỏi bảng điểm ảo không?`,
        status: 'danger',
        confirmText: 'Xóa',
        cancelText: 'Hủy'
      },
      panelClass: 'confirm-dialog',
      autoFocus: false
    });
    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed || !this.virtualTable) return;
      this.virtualTable.scores.splice(index, 1);
      this.markAsChanged();
      this.calculateVirtualGPA();
    });
  }

  toggleSubjectSelection(index: number): void {
    if (!this.virtualTable) return;
    this.virtualTable.scores[index].isSelected = !this.virtualTable.scores[index].isSelected;
    this.markAsChanged();
    this.calculateVirtualGPA();
  }

  _focusedValue: string | number | null = null;

  onInputFocus(value: string | number): void {
    this._focusedValue = value;
  }

  markAsChangedIfDifferent(currentValue: string | number): void {
    if (String(currentValue) !== String(this._focusedValue)) {
      this.hasUnsavedChanges = true;
    }
    this._focusedValue = null;
  }

  markAsChanged(): void {
    this.hasUnsavedChanges = true;
  }

  private markAsSaved(): void {
    this.hasUnsavedChanges = false;
  }

  createEmptyVirtualTable(): void {
    this.virtualTable = {
      studentInfo: {
        studentCode: this.loggedInStudentCode!,
        studentName: this.loggedInStudentName ?? '',
        studentClass: ''
      },
      scores: [],
      lastUpdated: new Date()
    };
    this.markAsChanged();
  }

  // ─── Dialogs ─────────────────────────────────────────────────────────────────

  openStatsDialog(): void {
    if (!this.virtualTable) return;
    const data: VirtualScoresStatsData = {
      scores: this.virtualTable.scores,
      gpa: this.virtualGPA,
      totalCredits: this.totalAccumulatedCredits,
      studentName: this.loggedInStudentName ?? this.loggedInStudentCode ?? ''
    };
    this.dialog.open(VirtualScoresStatsDialogComponent, {
      width: '660px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data,
      panelClass: 'vs-stats-dialog',
      autoFocus: false
    });
  }

  openVirtualCPACalculator(): void {
    if (!this.virtualTable) return;
    const data: VirtualCPACalculatorData = {
      currentCPA: this.virtualTableCPA,
      completedCredits: this.virtualTableCompletedCredits,
      failedSubjects: this.virtualTableFailedSubjects
    };
    this.dialog.open(VirtualCPACalculatorDialogComponent, {
      width: '900px', maxWidth: '95vw', data,
      panelClass: 'virtual-cpa-calculator-dialog', autoFocus: false
    });
  }

  openImportScoresDialog(): void {
    if (!this.virtualTable) return;
    const data: ImportScoresDialogData = { rawText: '', existingScores: this.virtualTable.scores };
    const ref = this.dialog.open(ImportScoresDialogComponent, {
      width: '900px', maxWidth: '95vw', maxHeight: '90vh', data,
      panelClass: 'import-scores-dialog', autoFocus: false
    });
    ref.afterClosed().subscribe((newScores: any[] | null) => {
      if (!newScores?.length || !this.virtualTable) return;
      this.virtualTable.scores.push(...newScores);
      this.calculateVirtualGPA();
      this.markAsChanged();
      this.toastService.success(`Đã thêm ${newScores.length} môn học từ Khảo Thí`, 4000);
    });
  }

  showUnsavedChangesDialog(onConfirm: () => void): void {
    if (!this.hasUnsavedChanges) { onConfirm(); return; }
    const data: UnsavedChangesDialogData = {
      hasUnsavedChanges: true,
      onSave: () => { this.saveVirtualTableToServer(); this.dialog.closeAll(); onConfirm(); },
      onDiscard: () => { this.markAsSaved(); this.dialog.closeAll(); onConfirm(); }
    };
    this.dialog.open(UnsavedChangesDialogComponent, {
      width: '500px', disableClose: true, data, panelClass: 'unsaved-changes-dialog'
    });
  }

  // ─── Display helpers ─────────────────────────────────────────────────────────

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

  getScoreClass(score: number, isFinal = false, scoreOverall = 0): string {
    if (typeof score !== 'number' || isNaN(score)) return '';
    const b = 'font-medium ';
    if (isFinal && this.isFailedSubject(score, scoreOverall)) return b + 'text-red-500';
    return this.getGradeClass(score);
  }

  getRowClass(score: VirtualScore): string {
    return this.isFailedSubject(score.scoreFinal, score.scoreOverall)
      ? 'bg-red-50 hover:bg-red-100 transition duration-150'
      : 'hover:bg-gray-50 transition duration-150';
  }

  formatNumber(num: number): string {
    if (typeof num !== 'number' || isNaN(num)) return '0.00';
    return num.toFixed(2);
  }

  parseScoreInput(value: string | number): number {
    const v = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
    return isNaN(v) ? 0 : Math.min(10, Math.max(0, Math.round(v * 10) / 10));
  }

  parseIntInput(value: string | number): number {
    const v = typeof value === 'string' ? parseInt(value, 10) : value;
    return isNaN(v) ? 0 : Math.max(0, v);
  }
}
