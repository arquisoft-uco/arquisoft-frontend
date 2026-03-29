import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./mapas-ruta').then(m => m.MapasRutaComponent),
    title: 'Mapas Ruta',
  },
] satisfies Routes;
