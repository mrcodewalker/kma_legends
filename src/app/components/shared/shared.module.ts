import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { CPACalculatorDialogComponent } from '../scores/cpa-calculator-dialog/cpa-calculator-dialog.component';

@NgModule({
  declarations: [
    ConfirmDialogComponent,
    CPACalculatorDialogComponent
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule
  ],
  exports: [
    ConfirmDialogComponent,
    CPACalculatorDialogComponent,
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule
  ]
})
export class SharedModule { } 