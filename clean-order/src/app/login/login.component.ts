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

  private authService = inject(AuthService);
  private router = inject(Router);

  onSubmit() {
    if (this.loginForm.valid) {
      const { correo, password } = this.loginForm.value;
      this.authService.loginRequest(correo, password).subscribe({
        next: (response) => {
          if (response.status === 200) {
            this.router.navigate(['/']);
          }
        },
        error: (err: { status: number }) => {
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
}
