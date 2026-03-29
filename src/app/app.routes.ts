import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';
import { ShellComponent } from './core/layout/shell/shell';

/**
 * `navItem` inside `data` marks a route as a sidebar navigation entry.
 *
 * Fields:
 *  - `label`  — text shown in the sidebar
 *  - `icon`   — Material icon ligature
 *  - `order`  — (optional) sort order; lower numbers appear first
 *
 * Routes without a `navItem` key are never listed in the sidebar.
 * Role-based visibility is derived automatically from the existing `roles` data.
 */
export interface NavItemData {
  label: string;
  icon: string;
  order?: number;
}

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
        data: {
          navItem: { label: 'Inicio', icon: 'home', order: 0 } satisfies NavItemData,
        },
      },
      {
        path: 'example-domain',
        loadChildren: () => import('./features/example-domain/example-domain.routes'),
        title: 'Example Domain',
        // canActivate: [roleGuard],
      },
      {
        path: 'fichas-perfil',
        loadChildren: () => import('./features/fichas-perfil/fichas-perfil.routes'),
        title: 'Fichas Perfil',
        data: {
          navItem: { label: 'Fichas Perfil', icon: 'description', order: 1 } satisfies NavItemData,
        },
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
