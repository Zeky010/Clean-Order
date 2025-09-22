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
          if (err.status === 401) {
            window.alert('Correo o Contraseña incorrectos');
          } else {
            window.alert('Error en el inicio de sesión');
          }
        },
      });
    }
  }
}
