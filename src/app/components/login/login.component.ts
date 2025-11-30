import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EncryptionService } from '../../services/encryption.service';
import { PublicKeyService } from '../../services/public-key.service';
import { LoginService } from '../../services/login.service';
import { EncryptedData } from '../../models/encryption.model';
import { Router } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
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
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  encryptedData: EncryptedData | null = null;
  errorMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private encryptionService: EncryptionService,
    private publicKeyService: PublicKeyService,
    private loginService: LoginService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  ngOnInit(): void {
    if(localStorage.getItem('schedule_secret')) {
      this.router.navigate(['/schedule']);
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
        this.loginService.login(formData).subscribe({
          next: (response) => {
            console.log('Login successful:', response);
            // Stringify the response before storing
            localStorage.setItem('schedule_secret', JSON.stringify(response));
            this.router.navigate(['/schedule']);
          },
          error: (error) => {
            console.error('Login failed:', error);
            this.errorMessage = error.error?.message || 'Invalid username or password. Please try again.';
            this.isLoading = false;
            
            // Clear error message after 5 seconds
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
