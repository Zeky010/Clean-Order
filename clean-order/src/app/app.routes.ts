import { Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';                    // Layout (header + sidebar)
import { OrdenesTrabajoComponent } from './ordenes-trabajo/ordenes-trabajo.component';
import { VehiculosComponent } from './vehiculos/vehiculos.component';
import { UsuarioComponent } from './usuarios/usuarios.component';
import { EmpleadosComponent } from './empleados/empleados.component';
import { ClientesComponent } from './clientes/clientes.component';

import { AuthGuard } from './services/authguard.service';
import { DashboardComponent } from './home/dashboard.component';          // 👈 hijo por defecto (panel)

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  // Home actúa como contenedor (layout) y sus hijos se renderizan dentro
  {
    path: '',
    component: HomeComponent,
    canMatch: [AuthGuard],
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      { path: '', component: DashboardComponent },                        // /  → Panel principal
      { path: 'ordenes-trabajo', component: OrdenesTrabajoComponent },    // /ordenes-trabajo
      { path: 'vehiculos',        component: VehiculosComponent },        // /vehiculos
      { path: 'usuarios',         component: UsuarioComponent },          // /usuarios
      { path: 'empleados',        component: EmpleadosComponent },        // /empleados
      { path: 'clientes',         component: ClientesComponent },         // /clientes
    ],
  },

  { path: '**', redirectTo: '' },
];