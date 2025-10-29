import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, of } from 'rxjs';

export type OrderStatus = 'pending' | 'progress' | 'done';

export interface Order {
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

  list(status?: string): Observable<Order[]> {
    // MOCK para probar pantallas (borra esto cuando tengas backend)
    return of([
      { id: 125, code: 'OT-00125', status: 'pending',  client:{name:'ServiGestión SpA'}, company:{name:'SG'} , created_at:'2025-08-12' },
      { id: 126, code: 'OT-00126', status: 'progress', client:{name:'Logística Sur Ltda.'}, company:{name:'LS'}, created_at:'2025-08-13' },
      { id: 127, code: 'OT-00127', status: 'done',     client:{name:'Tecno Norte S.A.'},  company:{name:'TN'}, created_at:'2025-08-14' },
    ]);

    // REAL:
    // let params = new HttpParams();
    // if (status) params = params.set('status', status);
    // return this.http.get<Order[]>(`${this.base}/orders`, { params });
  }

  detail(id: number): Observable<Order> {
    // MOCK
    return of({
      id,
      code: 'OT-00125',
      status: 'pending',
      created_at: '2025-08-12',
      client: { name: 'ServiGestión SpA' },
      company: { name: 'SG' },
      address: 'Av. Siempreviva 123',
      description: 'Mantención'
    });

    // REAL:
    // return this.http.get<Order>(`${this.base}/orders/${id}`);
  }

  uploadEvidence(id: number, kind: 'before'|'after', file: Blob, notes?: string): Observable<any> {
    // MOCK
    return of(true);

    // REAL:
    // const fd = new FormData();
    // fd.append('file', file);
    // fd.append('kind', kind);
    // if (notes) fd.append('notes', notes);
    // return this.http.post(`${this.base}/orders/${id}/evidence`, fd);
  }

  markDone(id: number): Observable<any> {
    // MOCK
    return of(true);

    // REAL:
    // return this.http.post(`${this.base}/orders/${id}/done`, {});
  }

  create(data: any): Observable<any> {
    // MOCK
    return of({ ok: true, id: 999 });

    // REAL:
    // return this.http.post(`${this.base}/orders`, data);
  }
}
