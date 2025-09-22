import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { VehiculosComponent } from './vehiculos/vehiculos.component';
import { AuthGuard } from './services/authguard.service';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    canMatch: [AuthGuard],
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      { path: '', component: HomeComponent },
      { path: 'vehiculos', component: VehiculosComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
