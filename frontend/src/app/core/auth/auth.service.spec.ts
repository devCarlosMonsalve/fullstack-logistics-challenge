import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { API_CONFIG } from '../services/api.config';
import { AuthResponse } from '../../shared/models/auth.models';

describe('AuthService', () => {
  let service: AuthService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
    localStorage.clear();
  });

  it('stores a valid session after login', () => {
    const response: AuthResponse = {
      accessToken: 'access-token',
      user: {
        id: 'user-1',
        name: 'Supervisor',
        email: 'supervisor@example.com',
        role: 'SUPERVISOR',
      },
    };

    service
      .login({ email: 'supervisor@example.com', password: 'password123' })
      .subscribe();

    const request = httpController.expectOne(`${API_CONFIG.baseUrl}/auth/login`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      email: 'supervisor@example.com',
      password: 'password123',
    });
    request.flush(response);

    expect(service.getToken()).toBe('access-token');
    expect(service.getCurrentUser()).toEqual(response.user);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('clears malformed stored user data', () => {
    localStorage.setItem('access_token', 'access-token');
    localStorage.setItem('current_user', '{"id":42}');

    expect(service.getCurrentUser()).toBeNull();
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('current_user')).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('posts registration without creating a local session', () => {
    const registration = {
      name: 'New operator',
      email: 'operator@example.com',
      password: 'password123',
      role: 'OPERATOR' as const,
    };

    service.register(registration).subscribe();

    const request = httpController.expectOne(
      `${API_CONFIG.baseUrl}/auth/register`,
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(registration);
    request.flush(null);
    expect(service.isAuthenticated()).toBe(false);
  });
});
