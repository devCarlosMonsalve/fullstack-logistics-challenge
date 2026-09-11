import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly returnUrl = this.getSafeReturnUrl();

  protected readonly loginForm = new FormGroup({
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
      validators: [Validators.required],
    }),
  });

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.isLoading.set(true);

    const { email, password } = this.loginForm.getRawValue();
    this.authService
      .login({ email: email.trim(), password })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          void this.router.navigateByUrl(this.returnUrl);
        },
        error: (error: unknown) => {
          this.errorMessage.set(this.getErrorMessage(error));
        },
      });
  }

  private getSafeReturnUrl(): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    if (
      returnUrl === null ||
      !returnUrl.startsWith('/') ||
      returnUrl.startsWith('//') ||
      returnUrl.includes('\\') ||
      /[\u0000-\u001f\u007f]/.test(returnUrl)
    ) {
      return '/shipments';
    }

    try {
      return this.router.serializeUrl(this.router.parseUrl(returnUrl));
    } catch {
      return '/shipments';
    }
  }

  private getErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'Unable to sign in. Please try again.';
    }

    const backendMessage = getBackendMessage(error.error);
    if (backendMessage !== null) {
      return backendMessage;
    }

    switch (error.status) {
      case 0:
        return 'Unable to connect to the server. Check your connection and try again.';
      case 401:
        return 'The email or password is incorrect.';
      case 429:
        return 'Too many sign-in attempts. Please wait and try again.';
      default:
        return 'Unable to sign in. Please try again.';
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
