import { Injectable, inject } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { vehiculo, VehiculoUpdate } from './vehiculo.types';

@Injectable({ providedIn: 'root' })
export class VehiculoService {

  private readonly baseUrl = `https://localhost:7226/vehiculo`;
  private readonly httpClient: HttpClient = inject(HttpClient);

  private httpOptions = {
  headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  listar(): Observable<vehiculo[]> {
    return this.httpClient.get<vehiculo[]>(this.baseUrl);
  }

  listarDisponibles(fechaAgendada: string, horasTrabajo: number): Observable<vehiculo[]> {
    const body = { fechaAgendada, horasTrabajo };
    return this.httpClient.post<vehiculo[]>(`${this.baseUrl}/disponibles`, body, this.httpOptions);
  }

  obtener(patente: string): Observable<vehiculo> {
    return this.httpClient.get<vehiculo>(`${this.baseUrl}/${encodeURIComponent(patente)}`);
  }

  crear(data: vehiculo): Observable<vehiculo> {
    return this.httpClient.post<vehiculo>(this.baseUrl, data, this.httpOptions);
  }

  actualizar(patente: string, data: VehiculoUpdate): Observable<vehiculo> {
    return this.httpClient.put<vehiculo>(`${this.baseUrl}/${encodeURIComponent(patente)}`, data, this.httpOptions);
  }

  eliminar(patente: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/${encodeURIComponent(patente)}`);
  }
}
