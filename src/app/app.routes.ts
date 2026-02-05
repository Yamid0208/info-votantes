import { Routes } from '@angular/router';
import { Layout } from './layout/layout/layout';
import { ScanerComponent } from './core/componets/scaner/scaner.component';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./core/componets/dashboard/dashboard').then(
            (m) => m.Dashboard,
          ),
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./core/componets/dashboard/dashboard').then(
            (m) => m.Dashboard,
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./core/componets/users/users').then(
            (m) => m.Users,
          ),
      },
      {
        path: 'scaner',
        loadComponent: () =>
          import('./core/componets/scaner/scaner.component').then(
            (m) => m.ScanerComponent,
          ),
      },
    ],
  },
];
