import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../auth.service';

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
  private readonly messageService = inject(MessageService);

  email = '';
  password = '';
  isSubmitting = false;

  onSubmit(): void {
    const email = this.email.trim();

    if (!email || !this.password) {
      this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Email and password are required.' });
      return;
    }

    this.isSubmitting = true;

    this.authService.login({ email, password: this.password }).subscribe({
      next: () => {
        this.router.navigateByUrl('/');
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Login failed', detail: 'Invalid credentials. Please try again.' });
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }
}
