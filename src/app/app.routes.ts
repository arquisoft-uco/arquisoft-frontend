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
      {
        path: 'proyectos-grado',
        loadChildren: () => import('./features/proyectos-grado/proyectos-grado.routes'),
        title: 'Proyectos Grado',
        data: { navItem: { label: 'Proyectos Grado', icon: 'school', order: 2 } satisfies NavItemData },
      },
      {
        path: 'artefactos',
        loadChildren: () => import('./features/artefactos/artefactos.routes'),
        title: 'Artefactos',
        data: { navItem: { label: 'Artefactos', icon: 'folder', order: 3 } satisfies NavItemData },
      },
      {
        path: 'entregables',
        loadChildren: () => import('./features/entregables/entregables.routes'),
        title: 'Entregables',
        data: { navItem: { label: 'Entregables', icon: 'send', order: 4 } satisfies NavItemData },
      },
      {
        path: 'evaluaciones',
        loadChildren: () => import('./features/evaluaciones/evaluaciones.routes'),
        title: 'Evaluaciones',
        data: { navItem: { label: 'Evaluaciones', icon: 'grading', order: 5 } satisfies NavItemData },
      },
      {
        path: 'mapas-ruta',
        loadChildren: () => import('./features/mapas-ruta/mapas-ruta.routes'),
        title: 'Mapas Ruta',
        data: { navItem: { label: 'Mapas Ruta', icon: 'map', order: 6 } satisfies NavItemData },
      },
      {
        path: 'repositorio-artefactos',
        loadChildren: () => import('./features/repositorio-artefactos/repositorio-artefactos.routes'),
        title: 'Repositorio Artefactos',
        data: { navItem: { label: 'Repositorio Artefactos', icon: 'cloud_upload', order: 7 } satisfies NavItemData },
      },
      {
        path: 'biblioteca',
        loadChildren: () => import('./features/biblioteca/biblioteca.routes'),
        title: 'Biblioteca',
        data: { navItem: { label: 'Biblioteca', icon: 'menu_book', order: 8 } satisfies NavItemData },
      },
      {
        path: 'solicitudes',
        loadChildren: () => import('./features/solicitudes/solicitudes.routes'),
        title: 'Solicitudes',
        data: { navItem: { label: 'Solicitudes', icon: 'assignment', order: 9 } satisfies NavItemData },
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
