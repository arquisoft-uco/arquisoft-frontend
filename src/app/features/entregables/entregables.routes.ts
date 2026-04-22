import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./entregables').then(m => m.EntregablesComponent),
    title: 'Entregables',
  },
] satisfies Routes;
