import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () =>
      import('./fichas-perfil').then(m => m.FichasPerfilComponent),
    title: 'Fichas Perfil',
  },
] satisfies Routes;
