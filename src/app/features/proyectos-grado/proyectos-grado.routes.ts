import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./proyectos-grado').then(m => m.ProyectosGradoComponent),
    title: 'Proyectos Grado',
  },
] satisfies Routes;
