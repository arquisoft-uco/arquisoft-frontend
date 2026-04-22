import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./artefactos').then(m => m.ArtefactosComponent),
    title: 'Artefactos',
  },
] satisfies Routes;
