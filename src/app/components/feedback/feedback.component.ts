import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss'],
  animations: [
    trigger('bounceAnimation', [
      state('normal', style({
        transform: 'scale(1)'
      })),
      state('bounce', style({
        transform: 'scale(1.1)'
      })),
      transition('normal <=> bounce', animate('200ms ease-in-out'))
    ])
  ]
})
export class FeedbackComponent {
  feedbackForm: FormGroup;
  isSubmitting = false;
  bounceState = 'normal';
  emojis = ['😊', '🎮', '💡', '✨', '🚀', '🌈'];
  currentEmojiIndex = 0;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.feedbackForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  startBounce() {
    this.bounceState = 'bounce';
    setTimeout(() => this.bounceState = 'normal', 200);
  }

  cycleEmoji() {
    this.currentEmojiIndex = (this.currentEmojiIndex + 1) % this.emojis.length;
    this.startBounce();
  }

  onSubmit() {
    if (this.feedbackForm.valid) {
      const { name, email, message } = this.feedbackForm.value;
      
      // Tạo nội dung email được format
      const emailBody = `
Xin chào,

Tôi là ${name} (${email}),

${message}

Trân trọng,
${name}
      `.trim();

      // Tạo URL trực tiếp đến Gmail compose
      const gmailComposeUrl = 'https://mail.google.com/mail/u/0/?fs=1&tf=cm' + 
        '&to=' + encodeURIComponent('mr.codewalker@gmail.com') +
        '&su=' + encodeURIComponent('[KMA Legend] Góp ý từ người dùng') +
        '&body=' + encodeURIComponent(emailBody);

      // Mở Gmail trong tab mới
      const newWindow = window.open(gmailComposeUrl, '_blank', 'noopener,noreferrer');
      
      if (newWindow) {
        newWindow.focus(); // Chuyển focus sang tab mới nếu mở thành công
        
        // Hiển thị thông báo và reset form
        this.dialog.open(ConfirmDialogComponent, {
          data: {
            title: 'Thành công',
            message: 'Gmail đã được mở trong tab mới. Vui lòng đăng nhập (nếu cần) và gửi email góp ý của bạn.',
            status: 'success',
            confirmText: 'Đóng'
          }
        });

        this.feedbackForm.reset();
      } else {
        // Nếu không mở được tab mới (có thể do popup blocker)
        this.dialog.open(ConfirmDialogComponent, {
          data: {
            title: 'Thông báo',
            message: 'Vui lòng cho phép trình duyệt mở tab mới và thử lại.',
            status: 'warning',
            confirmText: 'Đóng'
          }
        });
      }
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.feedbackForm.get(controlName);
    if (control?.hasError('required')) {
      return 'Trường này là bắt buộc';
    }
    if (control?.hasError('email')) {
      return 'Email không hợp lệ';
    }
    if (control?.hasError('minlength')) {
      return 'Nội dung góp ý phải có ít nhất 10 ký tự';
    }
    return '';
  }
} 