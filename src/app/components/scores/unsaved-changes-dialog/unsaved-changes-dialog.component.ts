import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface UnsavedChangesDialogData {
  hasUnsavedChanges: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

@Component({
  selector: 'app-unsaved-changes-dialog',
  template: `
    <div class="p-6">
      <div class="flex items-center mb-4">
        <div class="flex-shrink-0">
          <i class="fas fa-exclamation-triangle text-yellow-500 text-2xl"></i>
        </div>
        <div class="ml-3">
          <h3 class="text-lg font-medium text-gray-900">
            Có thay đổi chưa được lưu
          </h3>
        </div>
      </div>
      
      <div class="mb-6">
        <p class="text-sm text-gray-600">
          Bạn có thay đổi trong bảng điểm ảo chưa được lưu lên server. Bạn có muốn lưu trước khi thoát không?
        </p>
      </div>

      <div class="flex justify-end space-x-3">
        <button
          (click)="onDiscard()"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
        >
          Thoát không lưu
        </button>
        <button
          (click)="onCancel()"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
        >
          Hủy
        </button>
        <button
          (click)="onSave()"
          [disabled]="isSaving"
          class="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
        >
          <div *ngIf="isSaving" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <i *ngIf="!isSaving" class="fas fa-cloud-upload-alt"></i>
          <span>{{isSaving ? 'Đang lưu...' : 'Lưu và thoát'}}</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .mat-dialog-container {
      padding: 0 !important;
    }
  `]
})
export class UnsavedChangesDialogComponent {
  isSaving = false;

  constructor(
    public dialogRef: MatDialogRef<UnsavedChangesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UnsavedChangesDialogData
  ) {}

  onSave(): void {
    this.isSaving = true;
    this.data.onSave();
    // Dialog sẽ được đóng trong callback onSave
  }

  onDiscard(): void {
    this.data.onDiscard();
    this.dialogRef.close();
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
