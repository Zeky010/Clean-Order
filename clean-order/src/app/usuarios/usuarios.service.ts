import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario, UsuarioCreation, UsuarioUpdate } from './usuario.types';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'https://localhost:7226/usuario'; // Adjust your API URL

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };


  private httpClient: HttpClient = inject(HttpClient);
  getUsuarios(): Observable<Usuario[]> {
    return this.httpClient.get<Usuario[]>(this.apiUrl);
  }

  getUsuario(id: number): Observable<Usuario> {
    return this.httpClient.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  createUsuario(usuarioCreation: UsuarioCreation): Observable<Usuario> {
    return this.httpClient.post<Usuario>(this.apiUrl, usuarioCreation, this.httpOptions);
  }

  updateUsuario(usuario: Partial<UsuarioUpdate>): Observable<Usuario> {
    return this.httpClient.put<Usuario>(this.apiUrl, usuario, this.httpOptions);
  }

  asignarEmpleadoAUsuario(rutEmpleado: string, usuario: Usuario): Observable<Usuario> {
    return this.httpClient.put<Usuario>(`${this.apiUrl}/asignar-empleado/${rutEmpleado}`, usuario, this.httpOptions);
  }
}