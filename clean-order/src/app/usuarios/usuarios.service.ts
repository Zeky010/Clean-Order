import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from './usuario.types';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'https://localhost:7226/usuario/'; // Adjust your API URL

  private httpClient: HttpClient = inject(HttpClient);
  getUsuarios(): Observable<Usuario[]> {
    return this.httpClient.get<Usuario[]>(this.apiUrl);
  }

  getUsuario(id: number): Observable<Usuario> {
    return this.httpClient.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  createUsuario(usuario: Omit<Usuario, 'id'>): Observable<Usuario> {
    return this.httpClient.post<Usuario>(this.apiUrl, usuario);
  }

  updateUsuario(id: number, usuario: Partial<Usuario>): Observable<Usuario> {
    return this.httpClient.put<Usuario>(`${this.apiUrl}/${id}`, usuario);
  }

/*   deleteUsuario(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
  } */
}