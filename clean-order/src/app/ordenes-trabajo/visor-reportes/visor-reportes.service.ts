import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ReporteDetalle } from './reporte.types'

@Injectable({
  providedIn: 'root'
})
export class VisorReportesService {

  private apiUrl = 'https://localhost:7226/reportes';
  private httpClient: HttpClient = inject(HttpClient);

  getReportes(idOrden: number): Observable<ReporteDetalle[]> {
    return this.httpClient.get<ReporteDetalle[]>(`${this.apiUrl}/${idOrden}`);
  }
}