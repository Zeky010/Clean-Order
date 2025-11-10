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
      fd.append('observacion', reporte.observacion || ''); // Asegurar que no sea null/undefined
      fd.append('tipoReporte', reporte.tipoReporte.toString());
      fd.append('fecha', reporte.fecha.toISOString());
      
      // Agregar todas las imágenes con el MISMO nombre de campo
      reporte.imagenesReporte.forEach((img) => {
        fd.append('imagenes', img.imagenes, img.imagenes.name);
      });

      console.log('FormData a enviar:');
      fd.forEach((value, key) => {
        console.log(`${key}:`, value instanceof File ? `File: ${value.name}` : value);
      });

      return this.http.post<ReporteResponse>(`${this.base}/Reportes/`, fd);
  }
}

