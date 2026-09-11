import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../auth/auth.service';
import { API_CONFIG } from '../services/api.config';

describe('authInterceptor', () => {
  const getToken = vi.fn<() => string | null>();
  let http: HttpClient;
  let httpController: HttpTestingController;

  beforeEach(() => {
    getToken.mockReset();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: { getToken },
        },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpController.verify());

  it('adds a bearer token to protected shipment requests', () => {
    getToken.mockReturnValue('test-token');

    http.get(`${API_CONFIG.baseUrl}/shipments?page=1`).subscribe();

    const request = httpController.expectOne(
      `${API_CONFIG.baseUrl}/shipments?page=1`,
    );
    expect(request.request.headers.get('Authorization')).toBe(
      'Bearer test-token',
    );
    request.flush({});
  });

  it('does not add authorization to public or external requests', () => {
    getToken.mockReturnValue('test-token');

    http.post(`${API_CONFIG.baseUrl}/auth/login`, {}).subscribe();
    const loginRequest = httpController.expectOne(
      `${API_CONFIG.baseUrl}/auth/login`,
    );
    expect(loginRequest.request.headers.has('Authorization')).toBe(false);
    loginRequest.flush({});

    http.get('https://example.com/shipments').subscribe();
    const externalRequest = httpController.expectOne(
      'https://example.com/shipments',
    );
    expect(externalRequest.request.headers.has('Authorization')).toBe(false);
    externalRequest.flush({});
  });

  it('leaves protected requests unchanged when no token exists', () => {
    getToken.mockReturnValue(null);

    http.get(`${API_CONFIG.baseUrl}/shipments`).subscribe();

    const request = httpController.expectOne(`${API_CONFIG.baseUrl}/shipments`);
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });
});
