import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/train-components-management',
    pathMatch: 'full'
  },
  {
    path: 'train-components-management',
    loadComponent: () => import('./train-components-management/train-components-management').then(m => m.TrainComponentsManagement)
  },
  // Add more routes as needed
  {
    path: '**',
    redirectTo: '/train-components-management'
  }
];
