import { Component, Inject, AfterViewInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface VirtualCPACalculatorData {
  currentCPA: number; // CPA từ bảng điểm ảo
  completedCredits: number; // Số tín chỉ đã hoàn thành từ bảng ảo
  failedSubjects: number; // Số môn trượt từ bảng ảo
}

@Component({
  selector: 'app-virtual-cpa-calculator-dialog',
  templateUrl: './virtual-cpa-calculator-dialog.component.html',
  styleUrls: ['./virtual-cpa-calculator-dialog.component.scss']
})
export class VirtualCPACalculatorDialogComponent implements AfterViewInit {
  calculatorForm: FormGroup;
  requiredGPA: number = 0;
  remainingCredits: number = 0;
  hasCalculated: boolean = false;
  
  // Đề xuất học tập
  hardcoreSuggestions: {
    creditsPerSubject: number;
    subjects: number;
    note: string;
  }[] = [];
  
  chillSuggestions: {
    creditsPerSubject: number;
    subjects: number;
    note: string;
  }[] = [];
  
  // Options số tín chỉ/môn
  creditOptions = [2, 3, 4];
  selectedCredits: number[] = [2, 3]; // Mặc định tính cho 2 và 3 tín chỉ
  
  // Slider khả năng học tập
  studyCapabilityGrades = [
    { letter: 'D', value: 1.0, label: 'D (1.0)' },
    { letter: 'D+', value: 1.5, label: 'D+ (1.5)' },
    { letter: 'C', value: 2.0, label: 'C (2.0)' },
    { letter: 'C+', value: 2.4, label: 'C+ (2.4)' },
    { letter: 'B', value: 3.0, label: 'B (3.0)' },
    { letter: 'B+', value: 3.5, label: 'B+ (3.5)' },
    { letter: 'A', value: 3.8, label: 'A (3.8)' },
    { letter: 'A+', value: 4.0, label: 'A+ (4.0)' }
  ];
  selectedStudyCapability: number = 3.5; // Mặc định B+
  
  // Kết quả phân bổ thông minh
  smartDistribution: {
    creditsPerSubject: number;
    distribution: {
      grade: string;
      value: number;
      subjects: number;
      credits: number;
      expectedCPA: number; // CPA dự kiến khi đạt mức điểm này
    }[];
    totalSubjects: number;
    totalCreditsUsed: number;
    expectedCPA: number; // CPA tổng dự kiến
    note: string;
  }[] = [];
  
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<VirtualCPACalculatorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: VirtualCPACalculatorData,
    private renderer: Renderer2
  ) {
    this.calculatorForm = this.fb.group({
      totalCredits: ['', [Validators.required, Validators.min(1)]],
      targetCPA: ['', [Validators.required, Validators.min(0), Validators.max(4)]]
    });
  }
  
  ngAfterViewInit() {
    // Thêm class khi hasCalculated thay đổi
    this.updateDialogClass();
  }
  
  private updateDialogClass() {
    // Tìm dialog container và thêm/xóa class
    setTimeout(() => {
      const dialogContainer = document.querySelector('.virtual-cpa-calculator-dialog');
      if (dialogContainer) {
        if (this.hasCalculated) {
          this.renderer.addClass(dialogContainer, 'calculated');
        } else {
          this.renderer.removeClass(dialogContainer, 'calculated');
        }
      }
    }, 100);
  }

  calculate() {
    if (this.calculatorForm.invalid) {
      this.requiredGPA = 0;
      this.remainingCredits = 0;
      this.hasCalculated = false;
      this.hardcoreSuggestions = [];
      this.chillSuggestions = [];
      return;
    }

    const totalCredits = Number(this.calculatorForm.get('totalCredits')?.value);
    const targetCPA = Number(this.calculatorForm.get('targetCPA')?.value);

    if (!totalCredits || !targetCPA || totalCredits <= 0) {
      this.requiredGPA = 0;
      this.remainingCredits = 0;
      this.hasCalculated = false;
      this.hardcoreSuggestions = [];
      this.chillSuggestions = [];
      return;
    }

    // Số tín chỉ còn lại = Tổng số tín chỉ - Số tín chỉ đã hoàn thành từ bảng ảo
    this.remainingCredits = totalCredits - this.data.completedCredits;

    if (this.remainingCredits <= 0) {
      this.requiredGPA = 0;
      this.hasCalculated = true;
      this.hardcoreSuggestions = [];
      this.chillSuggestions = [];
      return;
    }

    // Công thức đúng: targetCPA * totalCredits = currentCPA * completedCredits + requiredGPA * remainingCredits
    // => requiredGPA = (targetCPA * totalCredits - currentCPA * completedCredits) / remainingCredits
    const currentPoints = this.data.currentCPA * this.data.completedCredits;
    const targetPoints = targetCPA * totalCredits;
    this.requiredGPA = (targetPoints - currentPoints) / this.remainingCredits;

    // KHÔNG giới hạn kết quả - để hiển thị đúng giá trị (có thể > 4 nếu không thể đạt được)
    this.hasCalculated = true;
    
    // Cập nhật class cho dialog để full height
    this.updateDialogClass();
    
    // Tính đề xuất học tập
    this.calculateSuggestions();
    this.calculateSmartDistribution();
  }
  
  toggleCreditOption(credits: number) {
    const index = this.selectedCredits.indexOf(credits);
    if (index > -1) {
      this.selectedCredits.splice(index, 1);
    } else {
      this.selectedCredits.push(credits);
    }
    // Tính lại đề xuất nếu đã tính toán
    if (this.hasCalculated) {
      this.calculateSuggestions();
      this.calculateSmartDistribution();
    }
  }
  
  onStudyCapabilityChange() {
    if (this.hasCalculated) {
      this.calculateSmartDistribution();
    }
  }
  
  onSliderChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const index = parseInt(target.value, 10);
    if (index >= 0 && index < this.studyCapabilityGrades.length) {
      this.selectedStudyCapability = this.studyCapabilityGrades[index].value;
      this.onStudyCapabilityChange();
    }
  }

  calculateSuggestions() {
    if (!this.hasCalculated || this.remainingCredits <= 0 || this.selectedCredits.length === 0) {
      this.hardcoreSuggestions = [];
      this.chillSuggestions = [];
      return;
    }

    const aPlusGrade = 4.0;
    const bPlusGrade = 3.5;
    const requiredPoints = this.requiredGPA * this.remainingCredits;
    const maxPointsWithAPlus = aPlusGrade * this.remainingCredits;
    const maxPointsWithBPlus = bPlusGrade * this.remainingCredits;

    this.hardcoreSuggestions = [];
    this.chillSuggestions = [];

    // Tính cho từng loại số tín chỉ được chọn
    for (const creditsPerSubject of this.selectedCredits) {
      const maxSubjects = Math.floor(this.remainingCredits / creditsPerSubject);
      
      // Hardcore: Tối ưu theo số môn A+ (4.0)
      if (requiredPoints <= maxPointsWithAPlus) {
        // Có thể đạt được với A+
        const aPlusSubjectsNeeded = Math.ceil(requiredPoints / (aPlusGrade * creditsPerSubject));
        const actualSubjects = Math.min(aPlusSubjectsNeeded, maxSubjects);
        
        if (actualSubjects > 0) {
          this.hardcoreSuggestions.push({
            creditsPerSubject,
            subjects: actualSubjects,
            note: actualSubjects === maxSubjects 
              ? `Cần tất cả ${actualSubjects} môn A+ (${creditsPerSubject} tín) để đạt CPA mục tiêu`
              : `Cần tối thiểu ${actualSubjects} môn A+ (${creditsPerSubject} tín) trong số ${maxSubjects} môn có thể để đạt CPA mục tiêu`
          });
        }
      } else {
        // Không thể đạt được ngay cả với tất cả A+
        if (maxSubjects > 0) {
          this.hardcoreSuggestions.push({
            creditsPerSubject,
            subjects: maxSubjects,
            note: `Cần tất cả ${maxSubjects} môn A+ (${creditsPerSubject} tín) nhưng vẫn không đủ để đạt CPA mục tiêu`
          });
        }
      }

      // Chill: Tối ưu theo B+ (3.5)
      if (requiredPoints <= maxPointsWithBPlus) {
        // Có thể đạt được với B+
        const bPlusSubjectsNeeded = Math.ceil(requiredPoints / (bPlusGrade * creditsPerSubject));
        const actualSubjects = Math.min(bPlusSubjectsNeeded, maxSubjects);
        
        if (actualSubjects > 0) {
          this.chillSuggestions.push({
            creditsPerSubject,
            subjects: actualSubjects,
            note: actualSubjects === maxSubjects
              ? `Cần tất cả ${actualSubjects} môn B+ (${creditsPerSubject} tín) để đạt CPA mục tiêu`
              : `Cần tối thiểu ${actualSubjects} môn B+ (${creditsPerSubject} tín) trong số ${maxSubjects} môn có thể để đạt CPA mục tiêu`
          });
        }
      } else {
        // Không thể đạt được với B+, cần điểm cao hơn
        if (maxSubjects > 0) {
          this.chillSuggestions.push({
            creditsPerSubject,
            subjects: maxSubjects,
            note: `Cần tất cả ${maxSubjects} môn B+ (${creditsPerSubject} tín) nhưng vẫn không đủ để đạt CPA mục tiêu. Cần điểm cao hơn B+`
          });
        }
      }
    }
  }
  
  calculateSmartDistribution() {
    if (!this.hasCalculated || this.remainingCredits <= 0 || this.selectedCredits.length === 0) {
      this.smartDistribution = [];
      return;
    }

    const requiredPoints = this.requiredGPA * this.remainingCredits;
    this.smartDistribution = [];

    // Tìm mức gần nhất với mức được chọn
    let selectedIndex = 0;
    let minDiff = Math.abs(this.studyCapabilityGrades[0].value - this.selectedStudyCapability);
    for (let i = 1; i < this.studyCapabilityGrades.length; i++) {
      const diff = Math.abs(this.studyCapabilityGrades[i].value - this.selectedStudyCapability);
      if (diff < minDiff) {
        minDiff = diff;
        selectedIndex = i;
      }
    }

    // Tính cho từng loại số tín chỉ được chọn
    for (const creditsPerSubject of this.selectedCredits) {
      const maxSubjects = Math.floor(this.remainingCredits / creditsPerSubject);
      if (maxSubjects === 0) continue;

      const distribution: {
        grade: string;
        value: number;
        subjects: number;
        credits: number;
        expectedCPA: number;
      }[] = [];
      
      let remainingPoints = requiredPoints;
      let remainingCreditsToDistribute = this.remainingCredits;
      
      // Tạo danh sách các mức điểm để phân bổ - CHỈ chấp nhận các mức >= mức khả năng học tập
      const distributionOrder: number[] = [];
      
      // Chỉ thêm các mức điểm từ mức được chọn trở lên (cao hơn hoặc bằng)
      for (let i = selectedIndex; i < this.studyCapabilityGrades.length; i++) {
        distributionOrder.push(i);
      }
      
      // Phân bổ điểm số theo thứ tự đã tạo
      for (const gradeIndex of distributionOrder) {
        if (remainingPoints <= 0 || remainingCreditsToDistribute <= 0) break;
        
        const grade = this.studyCapabilityGrades[gradeIndex];
        const pointsPerSubject = grade.value * creditsPerSubject;
        
        // Tính số môn cần để đạt điểm còn lại
        const neededSubjects = Math.ceil(remainingPoints / pointsPerSubject);
        const maxSubjectsForThisGrade = Math.min(
          neededSubjects,
          Math.floor(remainingCreditsToDistribute / creditsPerSubject)
        );
        
        if (maxSubjectsForThisGrade > 0 && gradeIndex >= selectedIndex) {
          // Chỉ phân bổ nếu mức điểm >= mức khả năng học tập
          // Phân bổ một phần (không dồn hết vào một mức)
          // Ưu tiên mức cao hơn được phân bổ nhiều hơn
          const priority = 1.5; // Ưu tiên các mức cao hơn
          const subjectsToUse = Math.min(
            maxSubjectsForThisGrade,
            Math.max(1, Math.floor(maxSubjectsForThisGrade * 0.4 * priority))
          );
          
          const creditsUsed = subjectsToUse * creditsPerSubject;
          const pointsUsed = grade.value * creditsUsed;
          
          // Tìm hoặc tạo entry cho mức điểm này
          let gradeEntry = distribution.find(d => d.value === grade.value);
          if (!gradeEntry) {
            gradeEntry = {
              grade: grade.letter,
              value: grade.value,
              subjects: 0,
              credits: 0,
              expectedCPA: 0
            };
            distribution.push(gradeEntry);
          }
          
          gradeEntry.subjects += subjectsToUse;
          gradeEntry.credits += creditsUsed;
          
          remainingPoints -= pointsUsed;
          remainingCreditsToDistribute -= creditsUsed;
        }
      }
      
      // Nếu còn thiếu điểm, bù thêm bằng các mức điểm cao hơn (ưu tiên)
      if (remainingPoints > 0 && remainingCreditsToDistribute > 0) {
        for (let i = this.studyCapabilityGrades.length - 1; i >= selectedIndex && remainingPoints > 0 && remainingCreditsToDistribute > 0; i--) {
          const grade = this.studyCapabilityGrades[i];
          const pointsPerSubject = grade.value * creditsPerSubject;
          const neededSubjects = Math.ceil(remainingPoints / pointsPerSubject);
          const maxSubjects = Math.min(
            neededSubjects,
            Math.floor(remainingCreditsToDistribute / creditsPerSubject)
          );
          
          if (maxSubjects > 0) {
            const creditsUsed = maxSubjects * creditsPerSubject;
            const pointsUsed = grade.value * creditsUsed;
            
            let gradeEntry = distribution.find(d => d.value === grade.value);
            if (!gradeEntry) {
            gradeEntry = {
              grade: grade.letter,
              value: grade.value,
              subjects: 0,
              credits: 0,
              expectedCPA: 0
            };
            distribution.push(gradeEntry);
          }
          
          gradeEntry.subjects += maxSubjects;
          gradeEntry.credits += creditsUsed;
            
            remainingPoints -= pointsUsed;
            remainingCreditsToDistribute -= creditsUsed;
          }
        }
      }
      
      // KHÔNG thêm các mức điểm thấp hơn mức khả năng học tập
      // Chỉ sử dụng các mức điểm >= mức khả năng học tập được chọn
      
      // Sắp xếp theo điểm từ cao xuống thấp
      distribution.sort((a, b) => b.value - a.value);
      
      const totalSubjects = distribution.reduce((sum, d) => sum + d.subjects, 0);
      const totalCreditsUsed = distribution.reduce((sum, d) => sum + d.credits, 0);
      const actualGPA = totalCreditsUsed > 0 ? (distribution.reduce((sum, d) => sum + d.value * d.credits, 0) / totalCreditsUsed) : 0;
      
      // Tính CPA tổng dự kiến khi đạt được tất cả các mức điểm được chấp nhận
      const currentPoints = this.data.currentCPA * this.data.completedCredits;
      const totalPointsFromDistribution = distribution.reduce((sum, d) => sum + d.value * d.credits, 0);
      const totalPointsAfter = currentPoints + totalPointsFromDistribution;
      const totalCreditsAfter = this.data.completedCredits + totalCreditsUsed;
      const expectedCPA = totalCreditsAfter > 0 ? totalPointsAfter / totalCreditsAfter : 0;
      
      // Không cần tính CPA cho từng mục riêng lẻ, chỉ cần CPA tổng
      distribution.forEach(item => {
        item.expectedCPA = expectedCPA; // Tất cả đều có cùng CPA tổng
      });
      
      // Tạo ghi chú
      const gradeList = distribution.map(d => `${d.subjects} môn ${d.grade}`).join(', ');
      const note = totalSubjects > 0
        ? `Phân bổ: ${gradeList}. Tổng: ${totalSubjects} môn (${totalCreditsUsed} tín chỉ). GPA thực tế: ${actualGPA.toFixed(2)}`
        : 'Không thể phân bổ với mức khả năng học tập này';
      
      this.smartDistribution.push({
        creditsPerSubject,
        distribution,
        totalSubjects,
        totalCreditsUsed,
        expectedCPA,
        note
      });
    }
  }

  isPossible(): boolean {
    return this.requiredGPA >= 0 && this.requiredGPA <= 4 && this.remainingCredits > 0;
  }

  close(): void {
    this.dialogRef.close();
  }

  formatNumber(num: number): string {
    if (typeof num !== 'number' || isNaN(num)) return '0.00';
    return num.toFixed(2);
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
  
  getSelectedCapabilityLabel(): string {
    const grade = this.studyCapabilityGrades.find(g => Math.abs(g.value - this.selectedStudyCapability) < 0.1);
    return grade ? grade.label : 'B+ (3.5)';
  }
  
  getSelectedCapabilityIndex(): number {
    const index = this.studyCapabilityGrades.findIndex(g => Math.abs(g.value - this.selectedStudyCapability) < 0.1);
    return index >= 0 ? index : 5; // Mặc định B+ (index 5)
  }
}

