import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from './clientes.types';

@Injectable({
    providedIn: 'root'
})
export class ClientesService {

    private apiUrl = 'https://localhost:7226/cliente';
    private httpClient: HttpClient = inject(HttpClient);

    private httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        })
    };
    getClientes(): Observable<Cliente[]> {
        return this.httpClient.get<Cliente[]>(this.apiUrl);
    }

    getCliente(id: number): Observable<Cliente> {
        return this.httpClient.get<Cliente>(`${this.apiUrl}/${id}`);
    }

    createCliente(cliente: Cliente): Observable<Cliente> {
        return this.httpClient.post<Cliente>(this.apiUrl, cliente, this.httpOptions);
    }

    updateCliente(rut: string, cliente: Cliente): Observable<Cliente> {
        return this.httpClient.put<Cliente>(`${this.apiUrl}/${rut}`, cliente, this.httpOptions);
    }

    deleteCliente(rut: string): Observable<void> {
        return this.httpClient.delete<void>(`${this.apiUrl}/${rut}`, this.httpOptions);
    }
}
