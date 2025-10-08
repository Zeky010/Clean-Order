import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { VehiculosComponent } from './vehiculos/vehiculos.component';
import { AuthGuard } from './services/authguard.service';
import { UsuarioComponent } from './usuarios/usuarios.component';
import { EmpleadosComponent } from './empleados/empleados.component';
import { ClientesComponent } from './clientes/clientes.component';
import { OrdenesTrabajoComponent } from './ordenes-trabajo/ordenes-trabajo.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    canMatch: [AuthGuard],
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      { path: '', component: HomeComponent },
      { path: 'vehiculos', component: VehiculosComponent },
      { path: 'usuarios', component: UsuarioComponent },
      { path: 'empleados', component: EmpleadosComponent },
      { path: 'clientes', component: ClientesComponent },
      { path: 'ordenes-trabajo', component: OrdenesTrabajoComponent }

    ]
  },
  { path: '**', redirectTo: '' }
];
