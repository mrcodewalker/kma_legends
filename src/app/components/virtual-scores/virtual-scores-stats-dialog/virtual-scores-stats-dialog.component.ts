import { Component, Inject, OnInit, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { VirtualScore, GRADE_CONVERSION } from '../../../models/scores.model';

export interface GradeStat {
  letter: string;
  classification: string;
  count: number;
  credits: number;
  color: string;
  bgColor: string;
  scale4: number;
}

export interface VirtualScoresStatsData {
  scores: VirtualScore[];
  gpa: number;
  totalCredits: number;
  studentName: string;
}

@Component({
  selector: 'app-virtual-scores-stats-dialog',
  templateUrl: './virtual-scores-stats-dialog.component.html',
  styleUrls: ['./virtual-scores-stats-dialog.component.scss']
})
export class VirtualScoresStatsDialogComponent implements OnInit, AfterViewInit {

  gradeStats: GradeStat[] = [];
  totalSelected = 0;
  totalCredits = 0;
  failedCount = 0;
  passedCount = 0;
  gpa = 0;
  animating = false;

  private readonly GRADE_COLORS: Record<string, { color: string; bg: string }> = {
    'A+': { color: '#059669', bg: '#d1fae5' },
    'A':  { color: '#10b981', bg: '#d1fae5' },
    'B+': { color: '#3b82f6', bg: '#dbeafe' },
    'B':  { color: '#6366f1', bg: '#e0e7ff' },
    'C+': { color: '#f59e0b', bg: '#fef3c7' },
    'C':  { color: '#f97316', bg: '#ffedd5' },
    'D+': { color: '#ef4444', bg: '#fee2e2' },
    'D':  { color: '#dc2626', bg: '#fee2e2' },
    'F':  { color: '#991b1b', bg: '#fecaca' },
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: VirtualScoresStatsData,
    public dialogRef: MatDialogRef<VirtualScoresStatsDialogComponent>
  ) {}

  ngOnInit(): void {
    this.computeStats();
  }

  ngAfterViewInit(): void {
    setTimeout(() => { this.animating = true; }, 100);
  }

  private computeStats(): void {
    const selectedScores = this.data.scores.filter(s => s.isSelected);
    this.totalSelected = selectedScores.length;
    this.gpa = this.data.gpa;
    this.totalCredits = this.data.totalCredits;

    // Init buckets
    const buckets: Record<string, GradeStat> = {};
    GRADE_CONVERSION.forEach(g => {
      const c = this.GRADE_COLORS[g.letter] ?? { color: '#6b7280', bg: '#f3f4f6' };
      buckets[g.letter] = {
        letter: g.letter,
        classification: g.classification,
        count: 0,
        credits: 0,
        color: c.color,
        bgColor: c.bg,
        scale4: g.scale4
      };
    });

    // Count
    selectedScores.forEach(score => {
      const letter = this.getLetterGrade(score.scoreOverall, score.scoreFinal);
      if (buckets[letter]) {
        buckets[letter].count++;
        buckets[letter].credits += score.subjectCredit;
      }
    });

    this.gradeStats = Object.values(buckets);
    this.failedCount = buckets['F']?.count ?? 0;
    this.passedCount = this.totalSelected - this.failedCount;
  }

  get maxCount(): number {
    return Math.max(1, ...this.gradeStats.map(g => g.count));
  }

  get maxCredits(): number {
    return Math.max(1, ...this.gradeStats.map(g => g.credits));
  }

  getBarWidth(count: number): number {
    return (count / this.maxCount) * 100;
  }

  getCreditBarWidth(credits: number): number {
    return (credits / this.maxCredits) * 100;
  }

  getGpaClass(): string {
    if (this.gpa >= 3.6) return 'gpa-excellent';
    if (this.gpa >= 3.2) return 'gpa-good';
    if (this.gpa >= 2.5) return 'gpa-average';
    if (this.gpa >= 2.0) return 'gpa-below';
    return 'gpa-poor';
  }

  getGpaLabel(): string {
    if (this.gpa >= 3.6) return 'Xuất sắc';
    if (this.gpa >= 3.2) return 'Giỏi';
    if (this.gpa >= 2.5) return 'Khá';
    if (this.gpa >= 2.0) return 'Trung bình';
    return 'Cần cải thiện';
  }

  // SVG line chart points for grade distribution
  get svgPolylinePoints(): string {
    const w = 520, h = 140, padding = 40;
    const grades = this.gradeStats.filter(g => g.letter !== 'F');
    const n = grades.length;
    if (n === 0) return '';
    const maxC = Math.max(1, ...grades.map(g => g.count));
    return grades.map((g, i) => {
      const x = padding + (i / (n - 1)) * (w - padding * 2);
      const y = h - padding - (g.count / maxC) * (h - padding * 2);
      return `${x},${y}`;
    }).join(' ');
  }

  get svgDotPoints(): Array<{ x: number; y: number; grade: GradeStat }> {
    const w = 520, h = 140, padding = 40;
    const grades = this.gradeStats.filter(g => g.letter !== 'F');
    const n = grades.length;
    if (n === 0) return [];
    const maxC = Math.max(1, ...grades.map(g => g.count));
    return grades.map((g, i) => ({
      x: padding + (i / (n - 1)) * (w - padding * 2),
      y: h - padding - (g.count / maxC) * (h - padding * 2),
      grade: g
    }));
  }

  private getLetterGrade(score10: number, scoreFinal: number): string {
    if (scoreFinal < 2) return 'F';
    const rounded = Math.round(score10 * 10) / 10;
    const grade = GRADE_CONVERSION.find(g => {
      const [min, max] = g.scale10.split(' - ').map(Number);
      return rounded >= min && rounded <= max;
    });
    return grade ? grade.letter : 'F';
  }

  formatNumber(n: number): string {
    return isNaN(n) ? '0.00' : n.toFixed(2);
  }

  close(): void {
    this.dialogRef.close();
  }
}
