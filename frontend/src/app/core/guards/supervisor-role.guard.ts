import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../auth/auth.service';

export const supervisorRoleGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
        return router.createUrlTree(['/login']);
    }

    return authService.getCurrentUser()?.role === 'SUPERVISOR'
        ? true
        : router.createUrlTree(['/shipments']);
};
