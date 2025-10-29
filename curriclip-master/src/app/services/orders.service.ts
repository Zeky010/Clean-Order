// src/app/services/orders.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type Status = 'pending' | 'progress' | 'done';

export interface EntityRef { 
  id?: number; 
  name: string 
}

export interface Order {
  id: string;
  code: string;
  status: Status;
  created_at: string;
  operator?: string | null;
  company?: EntityRef | null;
  client?: { id: number; name: string } | null;
  description?: string | null;
  address?: string | null;
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private base = (environment.API_BASE_URL || '').replace(/\/$/, '');

  constructor(private http: HttpClient) {}

  // Lista de órdenes
  list(status?: Status) {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Order[]>(`${this.base}/orders`, { params });
  }

  // Detalle de una orden
  detail(id: string) {
    return this.http.get<Order>(`${this.base}/orders/${id}`);
  }

  // Crear orden
  create(raw: { description?: string; address?: string; client_id?: string | number }) {
    const payload = {
      description: raw.description ?? null,
      address: raw.address ?? null,
      client_id: raw.client_id !== undefined && raw.client_id !== null && `${raw.client_id}` !== ''
        ? Number(raw.client_id)
        : null,
    };
    return this.http.post<Order>(`${this.base}/orders`, payload);
  }

  // Marcar como completada
  markDone(id: string) {
    return this.http.post(`${this.base}/orders/${id}/done`, {});
  }

  // Subir evidencia
  uploadEvidence(id: string, kind: 'before' | 'after', file: Blob, notes?: string) {
    const fd = new FormData();
    fd.append('kind', kind);
    fd.append('file', file);
    if (notes) fd.append('notes', notes);
    return this.http.post(`${this.base}/orders/${id}/evidences`, fd);
  }
}
