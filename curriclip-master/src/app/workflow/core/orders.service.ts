import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Orden } from './types';

export type OrderStatus = 'pending' | 'progress' | 'done';

export interface OrderOld {
  id: number;
  code: string;
  status: OrderStatus;
  created_at: string;
  client?: { name?: string };
  company?: { name?: string };
  address?: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** 🔹 Obtener órdenes reales del empleado autenticado */
  list(status?: string): Observable<Orden[]> {
    // Cookie JWT will be attached by interceptor
    return this.http.get<Orden[]>(`${this.base}/ordenes-trabajo/mine`);
  }

  /** 🔹 Detalle de una orden */
  detail(id: number): Observable<Orden> {
    return this.http.get<Orden>(`${this.base}/ordenes-trabajo/${id}`);
  }

  /** 🔹 Subir evidencia (si aplica) */
  uploadEvidence(id: number, kind: 'before' | 'after', file: Blob, notes?: string): Observable<any> {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('kind', kind);
    if (notes) fd.append('notes', notes);

    return this.http.post(`${this.base}/ordenes-trabajo/${id}/evidence`, fd);
  }

  /** 🔹 Marcar orden como completada */
  markDone(id: number): Observable<any> {
    return this.http.post(`${this.base}/ordenes-trabajo/${id}/done`, {});
  }

  /** 🔹 Crear nueva orden (si aplica desde móvil) */
  create(data: any): Observable<any> {
    return this.http.post(`${this.base}/ordenes-trabajo`, data);
  }
}
