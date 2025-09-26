import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rol } from './roles.types';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private apiUrl = 'https://localhost:7226/roles/'; // Adjust your API URL
  private httpClient: HttpClient = inject(HttpClient);

  getRoles(): Observable<Rol[]> {
    return this.httpClient.get<Rol[]>(this.apiUrl);
  }

  getRoleById(id: number): Observable<Rol> {
    return this.httpClient.get<Rol>(`${this.apiUrl}${id}`);
  }
/*
  createRole(role: Rol): Observable<Rol> {
    return this.httpClient.post<Rol>(this.apiUrl, role);
  }

  updateRole(role: Rol): Observable<Rol> {
    return this.httpClient.put<Rol>(`${this.apiUrl}${role.id}`, role);
  }

  deleteRole(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}${id}`);
  }
    */
}