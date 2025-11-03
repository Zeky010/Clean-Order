import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { EmpleadoService } from 'src/app/services/empleado.service';
import { switchMap, tap, finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
})
export class LoginPage {
  email = '';
  password = '';
  loading = false;
  error = '';

  private auth: AuthService = inject(AuthService);
  private router: Router = inject(Router);
  private empleadoService: EmpleadoService = inject(EmpleadoService);

  submit() {
    this.loading = true;
    this.error = '';

    if (!this.email || !this.password) {
      this.error = 'Por favor ingresa correo y contraseña';
      this.loading = false;
      return;
    }

    this.auth.login(this.email, this.password).pipe(
      tap(res => this.auth.guardarSesion(res)),
      switchMap(() => this.empleadoService.buscaEmpleadoApp(this.email)),
      tap(empleado => {
        if ((empleado.correo || '').toLowerCase() !== this.email.toLowerCase()) {
          throw { status: 404, message: 'El usuario no está enlazado a un empleado' };
        }
        this.auth.setEmpleado(empleado);
      }),
      tap(() => this.router.navigateByUrl('/wf', { replaceUrl: true })
      ),
      finalize(() => this.loading = false)
    ).subscribe({
      error: (err) => {
        switch (err.status) {
          case 401:
            this.error = 'Correo o contraseña incorrectos';
            break;
          case 403:
            this.error = 'Usuario no autorizado, debe ser un usuario empleado';
            break;
          case 404:
            this.error = 'El usuario no está enlazado a un empleado';
            break;
          default:
            this.error = 'Error de conexión con el servidor';
        }
        console.error('❌ Error de login:', err);
      }
    });
  }

  irARecuperar() {
    this.router.navigateByUrl('/pages/olvide'); // Ajusta si la ruta es diferente
  }
}
