import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:7226'; // ✅ Usa el mismo puerto que Swagger

  constructor(private http: HttpClient, private router: Router) {}

  // 🔐 LOGIN con API .NET (envía y recibe cookie AuthToken)
  login(correo: string, password: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/login`,
      { correo, password },
      { withCredentials: true } // 🔥 permite recibir la cookie AuthToken
    );
  }

  // 🔐 CERRAR SESIÓN (elimina cookie en el backend y limpia sessionStorage)
  logout(): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/logout`,
      {},
      { withCredentials: true }
    );
  }

  // 💾 Guarda la sesión del usuario localmente (correo + rol)
  guardarSesion(usuario: any) {
    sessionStorage.setItem('usuario', JSON.stringify(usuario));
  }

  // 🔎 Obtiene la sesión actual del usuario
  obtenerUsuario() {
    const user = sessionStorage.getItem('usuario');
    return user ? JSON.parse(user) : null;
  }

  // 🚪 Cierra sesión localmente (opcional si el backend ya elimina cookie)
  cerrarSesion() {
    sessionStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  // 🧩 Verifica si hay sesión activa
  estaAutenticado(): boolean {
    return !!sessionStorage.getItem('usuario');
  }
}
