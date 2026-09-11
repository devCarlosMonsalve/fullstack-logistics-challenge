import {
    HttpErrorResponse,
    HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../auth/auth.service';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const snackBar = inject(MatSnackBar);

    return next(request).pipe(
        catchError((error: unknown) => {
            if (!(error instanceof HttpErrorResponse)) {
                return throwError(() => error);
            }

            if (error.status === 401) {
                authService.logout();
                void router.navigate(['/login']);
            }

            snackBar.open(getErrorMessage(error), 'Close', {
                duration: 5000,
                horizontalPosition: 'end',
                verticalPosition: 'top',
            });

            return throwError(() => error);
        }),
    );
};

function getErrorMessage(error: HttpErrorResponse): string {
    const backendMessage = getBackendMessage(error.error);
    if (backendMessage !== null) {
        return backendMessage;
    }

    switch (error.status) {
        case 0:
            return 'Unable to connect to the server.';
        case 401:
            return 'Your session has expired. Please log in again.';
        case 403:
            return 'You do not have permission to perform this action.';
        case 404:
            return 'The requested resource was not found.';
        default:
            return 'An unexpected error occurred. Please try again.';
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
