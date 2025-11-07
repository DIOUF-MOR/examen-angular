import { Routes } from '@angular/router';
import { ListApprovisionnementComponent } from './approvisionnements/list-approvisionnement/list-approvisionnement.component';
import { NewApprovisionnementComponent } from './approvisionnements/new-approvisionnement/new-approvisionnement.component';

export const routes: Routes = [
     { path: '', redirectTo: 'list', pathMatch: 'full' },
  {
    path: 'list',
    component: ListApprovisionnementComponent,
  },
  {
    path: 'new',
    component: NewApprovisionnementComponent,
  },
  { path: '**', redirectTo: 'products' }
];
