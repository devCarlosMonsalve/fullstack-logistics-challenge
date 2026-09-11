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
        path: 'dashboard',
        canActivate: [authGuard, supervisorRoleGuard],
        loadComponent: () =>
        import('./features/dashboard/dashboard').then((m) => m.Dashboard),
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
        path: 'shipments/vehicle-assignment',
        canActivate: [authGuard, supervisorRoleGuard],
        loadComponent: () =>
        import(
            './features/shipments/vehicle-assignment/vehicle-assignment'
        ).then((m) => m.VehicleAssignmentComponent),
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