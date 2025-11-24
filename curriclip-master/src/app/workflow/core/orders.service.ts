import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Orden } from './types';
import { Reporte } from './reporte.type';
import { environmentTest } from 'src/environments/environment.test';

export type OrderStatus = 'pending' | 'progress' | 'done';



@Injectable({ providedIn: 'root' })
export class OrdersService {
  private base = environment.apiUrl;
  private http: HttpClient = inject(HttpClient);
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  /** 🔹 Obtener órdenes reales del empleado autenticado */
  list(status?: string): Observable<Orden[]> {
    // Cookie JWT will be attached by interceptor
    return this.http.get<Orden[]>(`${this.base}/ordenes-trabajo/mine`);
  }

  /** 🔹 Detalle de una orden */
  detail(id: number): Observable<Orden> {
    return this.http.get<Orden>(`${this.base}/ordenes-trabajo/mine/${id}`);
  }



  /** 🔹 Marcar orden como completada */
  markDone(id: number): Observable<any> {
    return this.http.post(`${this.base}/ordenes-trabajo/${id}/done`, {});
  }


}
