import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tipoCarga } from './vehiculo.types';

@Injectable({ providedIn: 'root' })
export class TipoCargaService {
  private readonly baseUrl = '/api';
  private readonly endpoint = `${this.baseUrl}/tipos-carga`;
  private readonly httpClient: HttpClient = inject(HttpClient);

  listar(): Observable<tipoCarga[]> {
    return this.httpClient.get<tipoCarga[]>(this.endpoint);
  }

  obtener(id: number): Observable<tipoCarga> {
    return this.httpClient.get<tipoCarga>(`${this.endpoint}/${id}`);
  }
}
