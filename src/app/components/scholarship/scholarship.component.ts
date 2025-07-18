import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SemesterService } from '../../services/semester.service';
import { CelebrationService } from '../../services/celebration.service';
import { CourseConfig, CourseFilter, ScholarshipStudent } from '../../models/scholarship.model';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-scholarship',
  templateUrl: './scholarship.component.html',
  styleUrls: ['./scholarship.component.scss']
})
export class ScholarshipComponent implements OnInit {
  selectedCourse = new FormControl('');
  scholarshipStudents: ScholarshipStudent[] = [];
  availableCourses: CourseFilter[] = [];
  loading = false;
  error: string | null = null;
  isDarkMode = false;
  isFireworksEnabled = false;

  private readonly courseConfigs: CourseConfig[] = [
    { prefix: 'CT', currentNumber: 7 },  // CT07 is current
    { prefix: 'DT', currentNumber: 6 },  // DT06 is current
    { prefix: 'AT', currentNumber: 19 }  // AT19 is current
  ];

  constructor(
    private semesterService: SemesterService,
    private celebrationService: CelebrationService
  ) {}

  ngOnInit() {
    this.initializeAvailableCourses();
    this.toggleFireworks();
  }

  toggleFireworks() {
    this.isFireworksEnabled = !this.isFireworksEnabled;
    this.isDarkMode = this.isFireworksEnabled; // Toggle dark mode with fireworks
    
    if (this.isFireworksEnabled) {
      this.celebrationService.startCelebration();
    } else {
      this.celebrationService.stopCelebration();
    }
  }

  private initializeAvailableCourses() {
    const currentYear = new Date().getFullYear();
    const graduationYear = currentYear - 4; // Students typically graduate after 4 years

    this.availableCourses = [];
    
    this.courseConfigs.forEach(config => {
      // Calculate the course number for the graduating class
      const graduatingNumber = config.currentNumber - 2; // Current - 2 years = graduating class
      
      // Generate 5 course numbers (from graduating class to newest class)
      for (let i = 0; i < 5; i++) {
        const courseNumber = graduatingNumber + i;
        const courseCode = `${config.prefix}${courseNumber.toString().padStart(2, '0')}`;
        
        this.availableCourses.push({
          value: courseCode,
          viewValue: courseCode
        });
      }
    });

    // Sort courses for better display
    this.availableCourses.sort((a, b) => a.value.localeCompare(b.value));
  }

  onCourseChange() {
    if (this.selectedCourse.value) {
      this.fetchScholarshipData(this.selectedCourse.value);
    }
  }

  private fetchScholarshipData(courseCode: string) {
    this.loading = true;
    this.error = null;
    
    // Don't stop celebration if fireworks are manually enabled
    if (!this.isFireworksEnabled) {
      this.celebrationService.stopCelebration();
    }

    this.semesterService.fetchScholarship({ code: courseCode })
      .subscribe({
        next: (data) => {
          this.scholarshipStudents = data;
          this.loading = false;
          if (data.length > 0 && !this.isFireworksEnabled) {
            // Only show temporary celebration if fireworks are not manually enabled
            this.celebrationService.startCelebration();
            setTimeout(() => {
              if (!this.isFireworksEnabled) {
                this.celebrationService.stopCelebration();
              }
            }, 5000);
          }
        },
        error: (error) => {
          this.error = 'Có lỗi xảy ra khi tải dữ liệu học bổng. Vui lòng thử lại sau.';
          this.loading = false;
          console.error('Error fetching scholarship data:', error);
        }
      });
  }

  exportToExcel(): void {
    if (!this.scholarshipStudents.length) {
      return;
    }

    // Prepare the data for export
    const exportData = this.scholarshipStudents.map((student, index) => ({
      'STT': index + 1,
      'MSSV': student.studentCode,
      'Họ và tên': student.studentName,
      'Lớp': student.studentClass,
      'Xếp hạng': student.ranking,
      'GPA (4.0)': student.gpa.toFixed(2),
      'GPA (10.0)': student.asiaGpa.toFixed(2)
    }));

    // Create worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    const colWidths = [
      { wch: 5 },  // STT
      { wch: 12 }, // MSSV
      { wch: 30 }, // Họ và tên
      { wch: 10 }, // Lớp
      { wch: 10 }, // Xếp hạng
      { wch: 10 }, // GPA (4.0)
      { wch: 10 }, // GPA (10.0)
    ];
    ws['!cols'] = colWidths;

    // Create workbook
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách học bổng');

    // Generate file name
    const fileName = `Danh_sach_hoc_bong_${this.selectedCourse.value}_${new Date().getTime()}.xlsx`;

    // Save file
    XLSX.writeFile(wb, fileName);
    
    // Show celebration effect only if fireworks are not manually enabled
    if (!this.isFireworksEnabled) {
      this.celebrationService.startCelebration();
      setTimeout(() => {
        if (!this.isFireworksEnabled) {
          this.celebrationService.stopCelebration();
        }
      }, 3000);
    }
  }

  getScholarshipLevel(ranking: number): string {
    if (ranking <= 5) return 'bg-yellow-100';
    if (ranking <= 10) return 'bg-blue-50';
    return '';
  }
}
