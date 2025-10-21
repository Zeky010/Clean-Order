import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [ReactiveFormsModule],
})
export class LoginComponent {
  loginForm: FormGroup = inject(FormBuilder).group({
    correo: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  loading = false;

  private authService = inject(AuthService);
  private router = inject(Router);

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { correo, password } = this.loginForm.value;

    this.authService.loginRequest(correo, password).subscribe({
      next: (response: any) => {
        this.loading = false;

        // Soporta HttpResponse o objeto plano
        const body = response?.body ?? response;

        // 1) Token en múltiples ubicaciones
        const token =
          body?.token ??
          body?.accessToken ??
          body?.jwt ??
          body?.data?.token ??
          body?.data?.accessToken ??
          body?.result?.token;

        if (token) localStorage.setItem('token', token);

        // 2) Usuario u objeto con datos
        const user =
          body?.user ??
          body?.usuario ??
          body?.data?.user ??
          body?.data?.usuario ??
          body?.result?.user ??
          null;

        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }

        // 3) Determinar displayName de forma robusta
        let displayName =
          user?.nombre ??
          user?.name ??
          user?.userName ??
          user?.username ??
          user?.fullName ??
          user?.correo ??
          user?.email ??
          null;

        // Si aún no hay nombre, intenta decodificar JWT
        if (!displayName && token) {
          try {
            const payloadB64 = token.split('.')[1];
            const norm = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
            const json = atob(norm);
            const payload = JSON.parse(json);
            displayName =
              payload?.name ??
              payload?.nombre ??
              payload?.user_name ??
              payload?.unique_name ??
              payload?.email ??
              payload?.correo ??
              null;
          } catch { /* ignore */ }
        }

        // Fallback: usa el correo del form
        if (!displayName) displayName = correo;

        localStorage.setItem('displayName', displayName);

        // Navegar si OK (acepto status 200 o flags típicos)
        if (response?.status === 200 || body?.success === true || body?.ok === true) {
          this.router.navigate(['/']);
        } else {
          // si tu API no usa HttpResponse, igual navega cuando venga token
          if (token) this.router.navigate(['/']);
        }
      },
      error: (err: { status: number }) => {
        this.loading = false;

        switch (err.status) {
          case 401:
            window.alert('Correo o Contraseña incorrectos');
            break;
          case 403:
            window.alert('Usuario inactivo. Contacte al administrador.');
            break;
          case 500:
            window.alert('Error en el servidor, intente más tarde');
            break;
          default:
            window.alert('Error en el inicio de sesión');
            break;
        }
      },
    });
  }
}