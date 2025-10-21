import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
})
export class HomeComponent implements OnInit {

  displayName = 'Usuario';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 1) Nombre guardado directamente
    const dn = localStorage.getItem('displayName');
    if (dn && dn.trim()) {
      this.displayName = dn;
      return;
    }

    // 2) Objeto user guardado
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        const name = u?.nombre ?? u?.name ?? u?.userName ?? u?.username ?? u?.fullName;
        const email = u?.correo ?? u?.email ?? u?.mail;
        this.displayName = (name || email || 'Usuario');
        return;
      } catch {/* sigue al plan C */}
    }

    // 3) Solo token: intentar decodificar JWT
    const token = localStorage.getItem('token');
    if (token) {
      const nameFromJwt = this.tryDecodeNameFromJWT(token);
      if (nameFromJwt) {
        this.displayName = nameFromJwt;
        return;
      }
    }
  }

  private tryDecodeNameFromJWT(token: string): string | null {
    try {
      const payloadB64 = token.split('.')[1];
      if (!payloadB64) return null;
      // compatibilidad URL-safe
      const norm = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
      const json = atob(norm);
      const payload = JSON.parse(json);

      const name  = payload?.name ?? payload?.nombre ?? payload?.user_name ?? payload?.unique_name;
      const email = payload?.email ?? payload?.correo;
      return (name || email || null);
    } catch {
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('displayName');
    this.authService.logout?.();
    this.router.navigate(['/login']);
  }
}