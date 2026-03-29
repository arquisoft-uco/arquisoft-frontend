import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./biblioteca').then(m => m.BibliotecaComponent),
    title: 'Biblioteca',
  },
] satisfies Routes;
