import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { supervisorRoleGuard } from './core/guards/supervisor-role.guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () =>
        import('./features/auth/login/login').then((m) => m.Login),
    },
    {
        path: 'register',
        canActivate: [authGuard, supervisorRoleGuard],
        loadComponent: () =>
        import('./features/auth/register/register').then((m) => m.Register),
    },
    {
        path: 'shipments',
        canActivate: [authGuard],
        loadComponent: () =>
        import('./features/shipments/shipment-list/shipment-list').then(
            (m) => m.ShipmentList,
        ),
    },
    {
        path: 'shipments/create',
        canActivate: [authGuard],
        loadComponent: () =>
        import('./features/shipments/shipment-create/shipment-create').then(
            (m) => m.ShipmentCreate,
        ),
    },
    {
        path: 'shipments/:id',
        canActivate: [authGuard],
        loadComponent: () =>
        import('./features/shipments/shipment-detail/shipment-detail').then(
            (m) => m.ShipmentDetail,
        ),
    },
    {
        path: 'tracking/:trackingCode',
        loadComponent: () =>
        import(
            './features/tracking/public-tracking/public-tracking'
        ).then((m) => m.PublicTracking),
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
    },
    {
        path: '**',
        redirectTo: 'login',
    },
];