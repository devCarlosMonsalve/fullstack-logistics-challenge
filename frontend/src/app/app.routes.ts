import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () =>
        import('./features/auth/login/login').then((m) => m.Login),
    },
    {
        path: 'register',
        loadComponent: () =>
        import('./features/auth/register/register').then((m) => m.Register),
    },
    {
        path: 'shipments',
        loadComponent: () =>
        import('./features/shipments/shipment-list/shipment-list').then(
            (m) => m.ShipmentList,
        ),
    },
    {
        path: 'shipments/create',
        loadComponent: () =>
        import('./features/shipments/shipment-create/shipment-create').then(
            (m) => m.ShipmentCreate,
        ),
    },
    {
        path: 'shipments/:id',
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