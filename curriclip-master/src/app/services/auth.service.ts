import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import type { EmpleadoApp } from './empleado.service';



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:7226'; // ajusta si tu backend usa otro puerto
  private usuarioActual: any = null;
  private readonly EMPLEADO_KEY = 'empleado';

  constructor(private http: HttpClient, private router: Router) {}

  // 🔐 LOGIN con API .NET
  login(correo: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login-app`, { correo, password });
  }

  // ✅ Guarda los datos de sesión
  guardarSesion(usuario: any) {
    this.usuarioActual = usuario;
    sessionStorage.setItem('usuario', JSON.stringify(usuario));
    if (usuario.token) {
      sessionStorage.setItem('token', usuario.token);
    }
  }

  // ✅ Obtiene el usuario autenticado
  obtenerUsuario() {
    if (this.usuarioActual) return this.usuarioActual;

    const data = sessionStorage.getItem('usuario');
    return data ? JSON.parse(data) : null;
  }

  // ✅ Cierra sesión
  cerrarSesion() {
    this.usuarioActual = null;
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  // ✅ Verifica si hay sesión activa
  estaAutenticado(): boolean {
    const token = sessionStorage.getItem('usuario');
    return !!token;
  }

  // (Opcional) para otros componentes
  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  // Guarda el empleado en la sesión del navegador
  setEmpleado(empleado: EmpleadoApp) {
    sessionStorage.setItem(this.EMPLEADO_KEY, JSON.stringify(empleado));
  }

  // Obtiene el empleado desde la sesión
  getEmpleado(): EmpleadoApp | null {
    const raw = sessionStorage.getItem(this.EMPLEADO_KEY);
    return raw ? JSON.parse(raw) as EmpleadoApp : null;
  }

  // Limpia la sesión (incluye empleado)
  limpiarSesion() {
    this.usuarioActual = null;
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  checkAuth(): Observable<boolean> {
    return this.http.get(`${this.apiUrl}/me`, { observe: 'response', withCredentials: true }).pipe(
      map(res => res.status === 200),
      catchError(() => of(false))
    );
  }


}
