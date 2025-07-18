import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { GRADE_CONVERSION, GradeConversion } from '../../../models/scores.model';

@Component({
  selector: 'app-grade-conversion-dialog',
  templateUrl: './grade-conversion-dialog.component.html',
  styleUrls: ['./grade-conversion-dialog.component.scss']
})
export class GradeConversionDialogComponent {
  gradeConversion = GRADE_CONVERSION;

  constructor(
    public dialogRef: MatDialogRef<GradeConversionDialogComponent>
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  getGradeRowClass(grade: GradeConversion): string {
    const [min] = grade.scale10.split(' - ').map(Number);
    if (min >= 8.5) return 'bg-green-50';
    if (min >= 7.0) return 'bg-blue-50';
    if (min >= 5.5) return 'bg-yellow-50';
    if (min >= 4.0) return 'bg-orange-50';
    return 'bg-red-50';
  }

  getGradeTextClass(grade: GradeConversion): string {
    const [min] = grade.scale10.split(' - ').map(Number);
    if (min >= 9.0) return 'text-green-600';
    if (min >= 8.5) return 'text-green-500';
    if (min >= 7.8) return 'text-blue-600';
    if (min >= 7.0) return 'text-blue-500';
    if (min >= 6.3) return 'text-yellow-600';
    if (min >= 5.5) return 'text-yellow-500';
    if (min >= 4.8) return 'text-orange-500';
    if (min >= 4.0) return 'text-orange-600';
    return 'text-red-500';
  }
} 