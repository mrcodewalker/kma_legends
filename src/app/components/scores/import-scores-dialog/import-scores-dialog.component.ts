import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VirtualScore } from '../../../models/scores.model';

export interface KhaoThiRow {
  subjectName: string;
  scoreFirst: number;   // TP1
  scoreSecond: number;  // TP2
  scoreOverall: number; // Điểm HP
  scoreFinal: number;   // Điểm thi
  scoreText: string;    // Điểm chữ
  subjectCredit: number;
  isDuplicate: boolean;
  isSelected: boolean;
}

export interface ImportScoresDialogData {
  rawText: string;
  existingScores: VirtualScore[];
}

@Component({
  selector: 'app-import-scores-dialog',
  template: `
    <div class="flex flex-col h-full max-h-[90vh]">
      <!-- Header -->
      <div class="flex items-center justify-between p-5 border-b border-gray-200 flex-shrink-0">
        <div class="flex items-center gap-3">
          <div class="bg-orange-100 rounded-lg p-2">
            <i class="fas fa-file-import text-orange-500 text-lg"></i>
          </div>
          <div>
            <h2 class="text-lg font-bold text-gray-800">Thêm điểm từ Khảo Thí</h2>
            <p class="text-xs text-gray-500 mt-0.5">Dán dữ liệu từ bảng Khảo Thí vào ô bên dưới</p>
          </div>
        </div>
        <button (click)="close()" class="text-gray-400 hover:text-gray-600 focus:outline-none">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <!-- Step 1: Paste input -->
      <div *ngIf="step === 1" class="flex flex-col gap-4 p-5 flex-1 overflow-auto">
        <p class="text-sm text-gray-600">
          Copy toàn bộ bảng điểm từ trang Khảo Thí (bao gồm cả header) rồi dán vào đây:
        </p>
        <textarea
          [(ngModel)]="pasteText"
          rows="12"
          placeholder="Dán dữ liệu vào đây..."
          class="w-full border border-gray-300 rounded-lg p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
        ></textarea>
        <div *ngIf="parseError" class="text-red-500 text-sm flex items-center gap-2">
          <i class="fas fa-exclamation-circle"></i> {{parseError}}
        </div>
        <div class="flex justify-end gap-3">
          <button (click)="close()" class="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Hủy</button>
          <button (click)="parseAndPreview()" class="px-4 py-2 text-sm text-white bg-orange-500 rounded-lg hover:bg-orange-600 flex items-center gap-2">
            <i class="fas fa-table"></i> Xem trước
          </button>
        </div>
      </div>

      <!-- Step 2: Preview & confirm -->
      <div *ngIf="step === 2" class="flex flex-col flex-1 overflow-hidden">
        <!-- Legend -->
        <div class="flex items-center gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs flex-shrink-0">
          <div class="flex items-center gap-1.5">
            <div class="w-3 h-3 rounded bg-yellow-200 border border-yellow-400"></div>
            <span class="text-gray-600">Trùng tên môn đã có — không tự chọn</span>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="w-3 h-3 rounded bg-white border border-gray-300"></div>
            <span class="text-gray-600">Môn mới — sẽ được thêm vào</span>
          </div>
          <span class="ml-auto text-gray-500">{{selectedCount}} / {{parsed.length}} môn được chọn</span>
        </div>

        <!-- Table -->
        <div class="overflow-auto flex-1">
          <table class="min-w-full text-sm">
            <thead class="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th class="px-3 py-2 text-left w-8">
                  <input type="checkbox" [checked]="areAllNonDuplicatesSelected()" (change)="toggleSelectAllNonDuplicates()" class="rounded">
                </th>
                <th class="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Môn học</th>
                <th class="px-3 py-2 text-center font-medium text-gray-500 uppercase tracking-wider w-14">TP1</th>
                <th class="px-3 py-2 text-center font-medium text-gray-500 uppercase tracking-wider w-14">TP2</th>
                <th class="px-3 py-2 text-center font-medium text-gray-500 uppercase tracking-wider w-16">Điểm thi</th>
                <th class="px-3 py-2 text-center font-medium text-gray-500 uppercase tracking-wider w-16">Điểm HP</th>
                <th class="px-3 py-2 text-center font-medium text-gray-500 uppercase tracking-wider w-14">Chữ</th>
                <th class="px-3 py-2 text-center font-medium text-gray-500 uppercase tracking-wider w-16">Trùng?</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr *ngFor="let row of parsed; let i = index"
                  [class.bg-yellow-50]="row.isDuplicate"
                  [class.hover:bg-yellow-100]="row.isDuplicate"
                  [class.hover:bg-gray-50]="!row.isDuplicate"
                  class="transition-colors">
                <td class="px-3 py-2">
                  <input type="checkbox" [(ngModel)]="row.isSelected" class="rounded"
                    [class.opacity-50]="row.isDuplicate">
                </td>
                <td class="px-3 py-2 font-medium" [class.text-yellow-800]="row.isDuplicate">
                  {{row.subjectName}}
                </td>
                <td class="px-3 py-2 text-center text-gray-600">{{row.scoreFirst || '—'}}</td>
                <td class="px-3 py-2 text-center text-gray-600">{{row.scoreSecond || '—'}}</td>
                <td class="px-3 py-2 text-center text-gray-600">{{row.scoreFinal || '—'}}</td>
                <td class="px-3 py-2 text-center font-medium" [class.text-yellow-800]="row.isDuplicate">
                  {{row.scoreOverall || '—'}}
                </td>
                <td class="px-3 py-2 text-center font-bold" [class.text-yellow-700]="row.isDuplicate">
                  {{row.scoreText || '—'}}
                </td>
                <td class="px-3 py-2 text-center">
                  <span *ngIf="row.isDuplicate" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
                    <i class="fas fa-exclamation-triangle mr-1"></i> Trùng
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer actions -->
        <div class="flex items-center justify-between p-4 border-t border-gray-200 bg-white flex-shrink-0">
          <button (click)="step = 1" class="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <i class="fas fa-arrow-left"></i> Quay lại
          </button>
          <div class="flex gap-3">
            <button (click)="close()" class="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Hủy</button>
            <button (click)="confirm()" [disabled]="selectedCount === 0"
              class="px-5 py-2 text-sm text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              <i class="fas fa-plus"></i> Thêm {{selectedCount}} môn
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; height: 100%; }
  `]
})
export class ImportScoresDialogComponent implements OnInit {
  step = 1;
  pasteText = '';
  parseError = '';
  parsed: KhaoThiRow[] = [];

  get selectedCount() {
    return this.parsed.filter(r => r.isSelected).length;
  }

  constructor(
    public dialogRef: MatDialogRef<ImportScoresDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImportScoresDialogData
  ) { }

  ngOnInit() {
    if (this.data.rawText) {
      this.pasteText = this.data.rawText;
    }
  }

  parseAndPreview() {
    this.parseError = '';
    const lines = this.pasteText.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);

    if (lines.length === 0) {
      this.parseError = 'Không có dữ liệu để phân tích.';
      return;
    }

    const rows: KhaoThiRow[] = [];
    const existingNames = new Set(
      this.data.existingScores.map(s => s.subjectName.trim().toLowerCase())
    );

    for (const line of lines) {
      const cols = line.split('\t');
      if (cols.length < 5) continue;

      // Bỏ qua dòng không bắt đầu bằng số (header hoặc dòng rác)
      const stt = parseInt(cols[0]);
      if (isNaN(stt)) continue;

      // Detect format dựa vào cols[1]:
      // - Có "Lựa chọn" (hoặc text không phải năm học): STT | Lựa chọn | Năm học | HK | Môn | Lần | TP1 | TP2 | ĐQT | Điểm thi | Điểm HP | Điểm chữ
      // - Không có "Lựa chọn": STT | Năm học | HK | Môn | Lần | TP1 | TP2 | ĐQT | Điểm thi | Điểm HP | Điểm chữ
      const col1 = cols[1].trim();
      const isYearFormat = /^\d{4}-\d{4}$/.test(col1);
      const isNumeric = !isNaN(parseFloat(col1));
      const hasLuaChonCol = !isYearFormat && !isNumeric;

      let subjectName: string, tp1: number, tp2: number, scoreFinal: number, scoreOverall: number, scoreText: string;

      if (hasLuaChonCol) {
        subjectName = (cols[4] || '').trim();
        tp1 = parseFloat(cols[6]) || 0;
        tp2 = parseFloat(cols[7]) || 0;
        scoreFinal = parseFloat(cols[9]) || 0;
        scoreOverall = parseFloat(cols[10]) || 0;
        scoreText = (cols[11] || '').trim();
      } else {
        subjectName = (cols[3] || '').trim();
        tp1 = parseFloat(cols[5]) || 0;
        tp2 = parseFloat(cols[6]) || 0;
        scoreFinal = parseFloat(cols[8]) || 0;
        scoreOverall = parseFloat(cols[9]) || 0;
        scoreText = (cols[10] || '').trim();
      }

      if (!subjectName) continue;

      const isDuplicate = existingNames.has(subjectName.toLowerCase());
      rows.push({
        subjectName,
        scoreFirst: tp1,
        scoreSecond: tp2,
        scoreFinal,
        scoreOverall,
        scoreText,
        subjectCredit: 0,
        isDuplicate,
        isSelected: !isDuplicate
      });
    }

    if (rows.length === 0) {
      this.parseError = 'Không parse được dữ liệu. Hãy đảm bảo copy đúng định dạng bảng từ Khảo Thí (có tab giữa các cột).';
      return;
    }

    this.parsed = rows;
    this.step = 2;
  }


  areAllNonDuplicatesSelected(): boolean {
    const nonDups = this.parsed.filter(r => !r.isDuplicate);
    return nonDups.length > 0 && nonDups.every(r => r.isSelected);
  }

  toggleSelectAllNonDuplicates() {
    const allSelected = this.areAllNonDuplicatesSelected();
    this.parsed.forEach(r => {
      if (!r.isDuplicate) r.isSelected = !allSelected;
    });
  }

  confirm() {
    const selected = this.parsed.filter(r => r.isSelected).map(r => ({
      subjectName: r.subjectName,
      scoreFirst: r.scoreFirst,
      scoreSecond: r.scoreSecond,
      scoreFinal: r.scoreFinal,
      scoreOverall: r.scoreOverall,
      scoreText: r.scoreText,
      subjectCredit: r.subjectCredit,
      isSelected: true
    } as VirtualScore));
    this.dialogRef.close(selected);
  }

  close() {
    this.dialogRef.close(null);
  }
}
