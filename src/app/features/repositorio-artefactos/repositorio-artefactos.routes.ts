import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./repositorio-artefactos').then(m => m.RepositorioArtefactosComponent),
    title: 'Repositorio Artefactos',
  },
] satisfies Routes;
