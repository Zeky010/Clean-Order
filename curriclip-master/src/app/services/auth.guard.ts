import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  private auth: AuthService = inject(AuthService);
  private router: Router = inject(Router);

  canActivate(): boolean {
    if (this.auth.estaAutenticado()) {
      return true;
    } else {
      this.router.navigate(['/pages/login']);
      return false;
    }
  }
}
