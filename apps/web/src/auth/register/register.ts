import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Role } from '@fullstack-logistic-wrk/prisma/generated';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  standalone: true,
  imports: [
    FormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    FloatLabelModule,
    SelectModule,
  ],
})
export class Register {
  private readonly authService = inject(AuthService);

  email = '';
  password = '';
  name = '';
  role = Role.OPERATOR;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  readonly roles = [
    { label: 'Operator', value: Role.OPERATOR },
    { label: 'Supervisor', value: Role.SUPERVISOR },
  ];

  onSubmit(): void {
    const email = this.email.trim();
    const name = this.name.trim();

    if (!email || !this.password) {
      this.errorMessage = 'Email and password are required.';
      this.successMessage = '';
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters.';
      this.successMessage = '';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      email,
      password: this.password,
      ...(name && { name }),
      role: this.role,
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.successMessage = `User "${email}" created successfully.`;
        this.email = '';
        this.password = '';
        this.name = '';
        this.role = Role.OPERATOR;
        this.isSubmitting = false;
      },
      error: (err) => {
        const message = err?.error?.message;
        this.errorMessage = Array.isArray(message)
          ? message.join(', ')
          : (message ?? 'Failed to create user. Please try again.');
        this.isSubmitting = false;
      },
    });
  }
}
