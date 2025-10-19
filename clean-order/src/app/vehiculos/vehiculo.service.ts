import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { vehiculo, VehiculoUpdate } from './vehiculo.types';

@Injectable({ providedIn: 'root' })
export class VehiculoService {
  private readonly baseUrl = '/api';
  private readonly endpoint = `${this.baseUrl}/vehiculos`;
  private readonly httpClient: HttpClient = inject(HttpClient);



  listar(): Observable<vehiculo[]> {
    return this.httpClient.get<vehiculo[]>(this.endpoint);
  }

  obtener(patente: string): Observable<vehiculo> {
    return this.httpClient.get<vehiculo>(`${this.endpoint}/${encodeURIComponent(patente)}`);
  }

  crear(data: vehiculo): Observable<vehiculo> {
    return this.httpClient.post<vehiculo>(this.endpoint, data);
  }

  actualizar(patente: string, data: VehiculoUpdate): Observable<vehiculo> {
    return this.httpClient.put<vehiculo>(`${this.endpoint}/${encodeURIComponent(patente)}`, data);
  }

  eliminar(patente: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.endpoint}/${encodeURIComponent(patente)}`);
  }
}
