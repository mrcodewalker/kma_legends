import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-login-virtual-calendar',
  templateUrl: './login-virtual-calendar.component.html',
  styleUrls: ['./login-virtual-calendar.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('void', style({
        opacity: 0,
        transform: 'translateY(20px)'
      })),
      transition(':enter', [
        animate('0.3s ease-out')
      ])
    ])
  ]
})
export class LoginVirtualCalendarComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    if(localStorage.getItem('virtual_calendar_secret')) {
      this.router.navigate(['/virtual-calendar']);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    if (control?.errors) {
      if (control.errors['required']) {
        return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} is required`;
      }
      if (control.errors['minlength']) {
        return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} must be at least ${control.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      const formData = this.loginForm.value;

      // Add a small delay to show loading state
      setTimeout(() => {
        // console.log(formData);
        this.loginService.loginVirtualCalendar(formData).subscribe({
          next: (response) => {
            // console.log('Login successful:', response);
            localStorage.setItem('virtual_calendar_secret', JSON.stringify(response));
            this.router.navigate(['/virtual-calendar']);
          },
          error: (error) => {
            console.error('Login failed:', error);
            this.errorMessage = error.error?.message || 'Invalid username or password. Please try again.';
            this.isLoading = false;
            
            setTimeout(() => {
              this.errorMessage = '';
            }, 5000);
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      }, 800); // Simulate network delay for better UX
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        control?.markAsTouched();
      });
    }
  }
}
