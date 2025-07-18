import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CPACalculation, ProgramInfo, PROGRAM_CREDITS } from '../../../models/scores.model';

@Component({
  selector: 'app-cpa-calculator-dialog',
  templateUrl: './cpa-calculator-dialog.component.html',
  styleUrls: ['./cpa-calculator-dialog.component.scss']
})
export class CPACalculatorDialogComponent {
  calculatorForm: FormGroup;
  programCredits = PROGRAM_CREDITS;
  selectedProgram: ProgramInfo | null = null;
  calculation: CPACalculation | null = null;
  
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CPACalculatorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      studentCode: string;
      currentCPA: number;
      completedCredits: number;
      failedSubjects: number;
    }
  ) {
    this.calculatorForm = this.fb.group({
      targetCPA: ['', [Validators.required, Validators.min(0), Validators.max(4)]],
    });

    // Determine program based on student code
    const programCode = this.data.studentCode.substring(0, 2).toUpperCase();
    this.selectedProgram = this.programCredits.find(p => p.code === programCode) || null;
  }

  calculate() {
    if (this.calculatorForm.invalid || !this.selectedProgram) return;

    const targetCPA = this.calculatorForm.get('targetCPA')?.value;
    const remainingCredits = this.selectedProgram.totalCredits - this.data.completedCredits;
    
    // Calculate required GPA for remaining credits
    // Formula: (targetCPA * totalCredits - currentCPA * completedCredits) / remainingCredits
    const requiredGPA = (targetCPA * this.selectedProgram.totalCredits - 
                        this.data.currentCPA * this.data.completedCredits) / remainingCredits;

    this.calculation = {
      targetCPA,
      remainingCredits,
      requiredGPA
    };
  }

  close(): void {
    this.dialogRef.close();
  }

  isPossible(): boolean {
    return this.calculation ? this.calculation.requiredGPA <= 4 && this.calculation.requiredGPA >= 0 : true;
  }
} 