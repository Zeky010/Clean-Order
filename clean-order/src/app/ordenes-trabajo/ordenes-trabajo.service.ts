import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, map } from 'rxjs';
import { OrdenTrabajo } from './ordenes-trabajo.types';
import { ordenEstado, OrdenForm, empleadoAsignar } from './orden-form/orden-form.type';

@Injectable({
  providedIn: 'root'
})
export class OrdenesTrabajoService {
  private apiUrl = 'https://localhost:7226/ordenes-trabajo';
  private httpClient: HttpClient = inject(HttpClient);

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  // Obtener todas las órdenes de trabajo
  getOrdenesTrabajo(): Observable<OrdenTrabajo[]> {
    return this.httpClient.get<OrdenTrabajo[]>(this.apiUrl);
  }

  // Crear nueva orden de trabajo
  createOrdenTrabajo(orden: OrdenForm): Observable<OrdenTrabajo> {
    return this.httpClient.post<OrdenTrabajo>(this.apiUrl, orden, this.httpOptions);
  }

  // Actualizar orden de trabajo existente
  updateOrdenTrabajo(id: number, orden: OrdenForm): Observable<OrdenTrabajo> {
    return this.httpClient.put<OrdenTrabajo>(`${this.apiUrl}/${id}`, orden, this.httpOptions);
  }

  // Eliminar orden de trabajo
  deleteOrdenTrabajo(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Obtener órdenes por cliente
  getOrdenesByCliente(idCliente: number): Observable<OrdenTrabajo[]> {
    return this.httpClient.get<OrdenTrabajo[]>(`${this.apiUrl}/cliente/${idCliente}`);
  }

  getEstados(): Observable<ordenEstado[]> {
    return this.httpClient.get<ordenEstado[]>(`${this.apiUrl}/estado/`);
  }

  // Empleados disponibles según fecha y horas (cambiado a POST con body)
  getEmpleadosDisponibles(fechaAgendada: string, horasTrabajo: number): Observable<empleadoAsignar[]> {
    if (!fechaAgendada || !horasTrabajo) return of([]);
    const body = { fechaAgendada, horasTrabajo };
    return this.httpClient.post<empleadoAsignar[]>(
      `${this.apiUrl}/empleados-disponibles`,
      body,
      this.httpOptions
    );
  }

  // Obtener órdenes por rango de fechas
  getOrdenesByFechas(fechaInicio: string, fechaFin: string): Observable<OrdenTrabajo[]> {
    return this.httpClient.get<OrdenTrabajo[]>(`${this.apiUrl}/fechas?inicio=${fechaInicio}&fin=${fechaFin}`);
  }

  // Cambiar estado de orden
  cambiarEstado(idOrden: number, idEstado: number): Observable<OrdenTrabajo> {
    return this.httpClient.patch<OrdenTrabajo>(`${this.apiUrl}/${idOrden}/estado`, { idEstado }, this.httpOptions);
  }

  // Reagendar orden
  reagendarOrden(idOrden: number, nuevaFecha: string): Observable<OrdenTrabajo> {
    return this.httpClient.patch<OrdenTrabajo>(`${this.apiUrl}/${idOrden}/reagendar`, { fechaAgendada: nuevaFecha }, this.httpOptions);
  }

  folioExiste(folio: number): Observable<boolean> {
    if (!folio) return of(false);
    return this.httpClient.get<string>(`${this.apiUrl}/folio/${folio}`)
      .pipe(map(resp => !!resp && resp.trim() !== ''));
  }
}