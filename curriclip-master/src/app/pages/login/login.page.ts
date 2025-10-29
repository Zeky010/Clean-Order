import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { loginData } from '../ordenes/login-data.type';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class LoginPage {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

 submit() {
    this.loading = true;
    this.error = '';

    if (!this.email || !this.password) {
      this.error = 'Por favor ingresa correo y contraseña';
      this.loading = false;
      return;
    }

    this.auth.login(this.email, this.password).subscribe({
      next: (response: loginData) => {
        console.log('🔹 Respuesta del servidor:', response);

        // ✅ Si la API devuelve correo y role, consideramos login exitoso
        if (response && response.correo) {
          // Guardamos la sesión (puede ser en sessionStorage o localStorage)
          this.auth.guardarSesion(response);
          console.log('✅ Usuario autenticado:', response.correo);

          // Redirigir a la página principal o dashboard
          this.router.navigateByUrl('/wf');
        } else {
          this.error = 'Credenciales incorrectas';
        }
      },
      error: (err) => {
        console.error('❌ Error de login:', err);
        if (err.status === 401 || err.status === 403) {
          this.error = 'Credenciales incorrectas';
        } else {
          this.error = 'Error de conexión con el servidor';
        }
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  // 🔹 Ir a la página de recuperación de contraseña
  irARecuperar() {
    this.router.navigateByUrl('/pages/olvide');
  }
}