import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from '../auth/auth.service';
import { API_CONFIG } from '../services/api.config';

const apiBaseUrl = API_CONFIG.baseUrl.replace(/\/+$/, '');

export const authInterceptor: HttpInterceptorFn = (request, next) => {
    if (!isProtectedBackendUrl(request.url)) {
        return next(request);
    }

    const token = inject(AuthService).getToken();
    if (token === null) {
        return next(request);
    }

    return next(
        request.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`,
            },
        }),
    );
};

function isProtectedBackendUrl(url: string): boolean {
    if (url !== apiBaseUrl && !url.startsWith(`${apiBaseUrl}/`)) {
        return false;
    }

    const path = url.slice(apiBaseUrl.length).split(/[?#]/, 1)[0];
    return (
        path === '/auth/register' ||
        path === '/shipments' ||
        path.startsWith('/shipments/')
    );
}
