import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./evaluaciones').then(m => m.EvaluacionesComponent),
    title: 'Evaluaciones',
  },
] satisfies Routes;
