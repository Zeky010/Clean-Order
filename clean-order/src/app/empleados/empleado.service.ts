import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Empleado } from './empleado.types';

@Injectable({
  providedIn: 'root'
})
export class EmpleadoService {
  private readonly baseUrl = 'https://localhost:7226/empleado';
  private httpClient: HttpClient = inject(HttpClient);
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };



  // Get all empleados
  getEmpleados(): Observable<Empleado[]> {
    return this.httpClient.get<Empleado[]>(this.baseUrl);
  }

  // Get empleado by RUT
  getEmpleadoByRut(rut: number): Observable<Empleado> {
    return this.httpClient.get<Empleado>(`${this.baseUrl}/${rut}`);
  }

  // Create new empleado
  createEmpleado(empleado: Empleado): Observable<Empleado> {
    return this.httpClient.post<Empleado>(this.baseUrl, empleado, this.httpOptions);
  }

  // Update empleado
  updateEmpleado(empleado: Empleado): Observable<Empleado> {
    return this.httpClient.put<Empleado>(`${this.baseUrl}`, empleado, this.httpOptions);
  }

  // Delete empleado
  deleteEmpleado(rut: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/${rut}`);
  }

  // Get active empleados only
  getActiveEmpleados(): Observable<Empleado[]> {
    return this.httpClient.get<Empleado[]>(`${this.baseUrl}?activo=1`);
  }

  // Get empleados by comuna
  getEmpleadosByComuna(idComuna: number): Observable<Empleado[]> {
    return this.httpClient.get<Empleado[]>(`${this.baseUrl}?idComuna=${idComuna}`);
  }
}