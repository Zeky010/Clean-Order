import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmpleadoService {
  private apiUrl = 'https://localhost:7226/Empleado';
  private http = inject(HttpClient);

  buscaEmpleadoApp(correo: string): Observable<EmpleadoApp> {
    return this.http.get<EmpleadoApp>(`${this.apiUrl}/get-by-user/${encodeURIComponent(correo)}`);
  }
}

export interface EmpleadoApp {
  rut: number;
  dv: string;
  nombre: string;
  apellido: string;
  correo: string;
}

