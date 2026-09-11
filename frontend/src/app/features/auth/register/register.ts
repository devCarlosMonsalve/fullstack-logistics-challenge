import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { UserRole } from '../../../shared/models/auth.models';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly roles: ReadonlyArray<{
    value: UserRole;
    label: string;
  }> = [
    { value: 'OPERATOR', label: 'Operator' },
    { value: 'SUPERVISOR', label: 'Supervisor' },
  ];

  protected readonly registerForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        Validators.pattern(/\S/),
      ],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.email,
        Validators.maxLength(254),
      ],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(128),
      ],
    }),
    role: new FormControl<UserRole>('OPERATOR', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.isLoading.set(true);

    const { name, email, password, role } = this.registerForm.getRawValue();

    this.authService
      .register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.snackBar.open('User registered successfully.', 'Close', {
            duration: 4000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
          void this.router.navigate(['/shipments']);
        },
        error: (error: unknown) => {
          this.errorMessage.set(this.getErrorMessage(error));
        },
      });
  }

  private getErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'Unable to register the user. Please try again.';
    }

    const backendMessage = getBackendMessage(error.error);
    if (backendMessage !== null) {
      return backendMessage;
    }

    switch (error.status) {
      case 0:
        return 'Unable to connect to the server. Check your connection and try again.';
      case 400:
        return 'Review the user details and try again.';
      case 403:
        return 'Only supervisors can register users.';
      case 409:
        return 'A user with this email address already exists.';
      default:
        return 'Unable to register the user. Please try again.';
    }
  }
}

function getBackendMessage(body: unknown): string | null {
  if (typeof body !== 'object' || body === null || !('message' in body)) {
    return null;
  }

  const message = body.message;
  if (typeof message === 'string' && message.trim().length > 0) {
    return message;
  }

  if (Array.isArray(message)) {
    const messages = message.filter(
      (item): item is string =>
        typeof item === 'string' && item.trim().length > 0,
    );
    return messages.length > 0 ? messages.join(' ') : null;
  }

  return null;
}
