import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Reporte, ReporteTipo, imagenReporte } from './reporte.types'

@Injectable({
  providedIn: 'root'
})
export class VisorReportesService {

  private apiUrl = 'https://localhost:7226/reportes';
  private httpClient: HttpClient = inject(HttpClient);

  getReportes(idOrden: number): Observable<Reporte[]> {
    return this.httpClient.get<Reporte[]>(`${this.apiUrl}/${idOrden}`);
  }
}