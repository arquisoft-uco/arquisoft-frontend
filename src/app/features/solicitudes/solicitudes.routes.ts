import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./solicitudes').then(m => m.SolicitudesComponent),
    title: 'Solicitudes',
  },
] satisfies Routes;
