import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../auth.service';
import { FloatLabelModule } from 'primeng/floatlabel';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  imports: [
    CommonModule, 
    FormsModule, 
    CardModule, 
    InputTextModule, 
    ButtonModule,
    FloatLabelModule
],
  standalone: true,
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  isSubmitting = false;
  errorMessage = '';

  onSubmit(): void {
    const email = this.email.trim();

    if (!email || !this.password) {
      this.errorMessage = 'Email and password are required.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.authService.login({ email, password: this.password }).subscribe({
      next: () => {
        this.router.navigateByUrl('/');
      },
      error: () => {
        this.errorMessage = 'Invalid credentials. Please try again.';
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }
}
