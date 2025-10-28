import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tipoCarga } from '../vehiculo.types';

@Injectable({ providedIn: 'root' })
export class TipoCargaService {

  private readonly baseUrl = `https://localhost:7226/tipos-carga`;
  private readonly httpClient: HttpClient = inject(HttpClient);

  listar(): Observable<tipoCarga[]> {
    return this.httpClient.get<tipoCarga[]>(this.baseUrl);
  }

  obtener(id: number): Observable<tipoCarga> {
    return this.httpClient.get<tipoCarga>(`${this.baseUrl}/${id}`);
  }
}
