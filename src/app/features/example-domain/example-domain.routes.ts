import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () =>
      import('./components/example-list/example-list').then(m => m.ExampleListComponent),
    title: 'Example Domain',
  },
] satisfies Routes;
