import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { API_CONFIG } from '../services/api.config';
import {
    AuthResponse,
    LoginRequest,
    RegisterRequest,
} from '../../shared/models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
    private readonly tokenKey = 'access_token';

    constructor(private readonly http: HttpClient) {}

    register(request: RegisterRequest): Observable<void> {
        return this.http.post<void>(`${API_CONFIG.baseUrl}/auth/register`, request);
    }

    login(request: LoginRequest): Observable<AuthResponse> {
        return this.http
            .post<AuthResponse>(`${API_CONFIG.baseUrl}/auth/login`, request)
            .pipe(tap(({ accessToken }) => this.storeToken(accessToken)));
    }

    logout(): void {
        localStorage.removeItem(this.tokenKey);
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    isAuthenticated(): boolean {
        return this.getToken() !== null;
    }

    private storeToken(token: string): void {
        localStorage.setItem(this.tokenKey, token);
    }
}