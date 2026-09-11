import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';

import { authGuard } from './auth.guard';
import { AuthService } from '../auth/auth.service';

describe('authGuard', () => {
  const isAuthenticated = vi.fn<() => boolean>();

  beforeEach(() => {
    isAuthenticated.mockReset();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { isAuthenticated },
        },
      ],
    });
  });

  it('allows authenticated users', () => {
    isAuthenticated.mockReturnValue(true);

    const result = runGuard('/shipments');

    expect(result).toBe(true);
  });

  it('redirects unauthenticated users and preserves the return URL', () => {
    isAuthenticated.mockReturnValue(false);
    const router = TestBed.inject(Router);

    const result = runGuard('/shipments?page=2') as UrlTree;

    expect(router.serializeUrl(result)).toBe(
      '/login?returnUrl=%2Fshipments%3Fpage%3D2',
    );
  });
});

function runGuard(url: string): boolean | UrlTree {
  return TestBed.runInInjectionContext(
    () =>
      authGuard(
        {} as ActivatedRouteSnapshot,
        { url } as RouterStateSnapshot,
      ) as boolean | UrlTree,
  );
}
