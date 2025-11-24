import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'https://localhost:7226';
  private http = inject(HttpClient);

  // Call an endpoint that returns 200 when the AuthToken cookie is valid
  checkAuth(): Observable<boolean> {
    return this.http.get(`${this.apiUrl}/me`, { observe: 'response', withCredentials: true }).pipe(
      map(res => res.status === 200),
      catchError(() => of(false))
    );
  }

  // Login posts credentials; cookie is set by backend
  loginRequest(correo: string, password: string) {
    return this.http.post(`${this.apiUrl}/login`, { correo, password }, { observe: 'response', withCredentials: true });
  }

  // Calls backend to delete the cookie
  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {}, { withCredentials: true });
  }
}
