import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environmentTest } from 'src/environments/environment.test';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmpleadoService {
  private apiUrl = environment.apiUrl+'/Empleado';
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

