import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { API_CONFIG } from '../services/api.config';
import {
    AuthenticatedUser,
    AuthResponse,
    LoginRequest,
    RegisterRequest,
} from '../../shared/models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
    private readonly tokenKey = 'access_token';
    private readonly userKey = 'current_user';

    constructor(private readonly http: HttpClient) {}

    register(request: RegisterRequest): Observable<void> {
        return this.http.post<void>(`${API_CONFIG.baseUrl}/auth/register`, request);
    }

    login(request: LoginRequest): Observable<AuthResponse> {
        return this.http
            .post<AuthResponse>(`${API_CONFIG.baseUrl}/auth/login`, request)
            .pipe(tap((response) => this.storeSession(response)));
    }

    logout(): void {
        const storage = this.getStorage();
        if (storage === null) {
            return;
        }

        try {
            storage.removeItem(this.tokenKey);
            storage.removeItem(this.userKey);
        } catch {
            // Storage can be unavailable when the browser blocks access to it.
        }
    }

    getToken(): string | null {
        try {
            return this.getStorage()?.getItem(this.tokenKey) ?? null;
        } catch {
            return null;
        }
    }

    getCurrentUser(): AuthenticatedUser | null {
        try {
            const storedUser = this.getStorage()?.getItem(this.userKey);
            if (storedUser === null || storedUser === undefined) {
                return null;
            }

            const user: unknown = JSON.parse(storedUser);
            if (!this.isAuthenticatedUser(user)) {
                this.logout();
                return null;
            }

            return user;
        } catch {
            this.logout();
            return null;
        }
    }

    isAuthenticated(): boolean {
        return this.getToken() !== null && this.getCurrentUser() !== null;
    }

    private storeSession(response: AuthResponse): void {
        const storage = this.getStorage();
        if (
            storage === null ||
            typeof response.accessToken !== 'string' ||
            response.accessToken.length === 0 ||
            !this.isAuthenticatedUser(response.user)
        ) {
            this.logout();
            return;
        }

        try {
            storage.setItem(this.tokenKey, response.accessToken);
            storage.setItem(this.userKey, JSON.stringify(response.user));
        } catch {
            this.logout();
        }
    }

    private getStorage(): Storage | null {
        try {
            return typeof localStorage === 'undefined' ? null : localStorage;
        } catch {
            return null;
        }
    }

    private isAuthenticatedUser(value: unknown): value is AuthenticatedUser {
        if (typeof value !== 'object' || value === null) {
            return false;
        }

        const user = value as Record<string, unknown>;
        return (
            typeof user['id'] === 'string' &&
            typeof user['name'] === 'string' &&
            typeof user['email'] === 'string' &&
            (user['role'] === 'OPERATOR' || user['role'] === 'SUPERVISOR')
        );
    }
}