import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';
import { ShellComponent } from './core/layout/shell/shell';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent),
        title: 'Dashboard',
      },
      {
        path: 'example-domain',
        loadChildren: () => import('./features/example-domain/example-domain.routes'),
        title: 'Example Domain',
        // Uncomment and set roles to restrict by role:
        // canActivate: [roleGuard],
        // data: { roles: ['example-role'] },
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  {
    path: 'forbidden',
    loadComponent: () =>
      import('./shared/components/forbidden/forbidden').then(m => m.ForbiddenComponent),
    title: 'Acceso Denegado',
  },
  { path: '**', redirectTo: '' },
];
