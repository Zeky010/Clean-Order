import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Reporte } from './reporte.type';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface ReporteResponse {
  mensaje: string;
  idReporte: number;
  cantidadImagenes: number;
}

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private base = environment.apiUrl;
  private http: HttpClient = inject(HttpClient);

  uploadReporte(reporte: Reporte): Observable<ReporteResponse> {
      const fd = new FormData();
      
      // Agregar datos del reporte
      fd.append('correoUsuario', reporte.correoUsuario);
      fd.append('idOrden', reporte.idOrden.toString());
      fd.append('observacion', reporte.observacion);
      fd.append('tipoReporte', reporte.tipoReporte.toString());
      fd.append('fecha', reporte.fecha.toISOString());
      
      // Agregar todas las imágenes del arreglo imagenesReporte
      reporte.imagenesReporte.forEach((img, index) => {
      fd.append(`imagenes[${index}]`, img.imagenes, img.imagenes.name);
      fd.append(`tipoMime[${index}]`, img.tipoMime);
      });

      // NO establecer headers - HttpClient lo hace automáticamente con el boundary correcto
      return this.http.post<ReporteResponse>(`${this.base}/reportes/${reporte.idOrden}/evidence`, fd);
  }
}

