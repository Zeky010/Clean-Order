import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Documento, DocumentoSinArchivo } from './documento.types';


@Injectable({
    providedIn: 'root'
})
export class DocumentoService {
    private apiUrl = 'https://localhost:7226/documento';
    private httpClient: HttpClient = inject(HttpClient);

    private httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        })
    };

    // Obtener todos los documentos
    getDocumentos(): Observable<DocumentoSinArchivo[]> {
        return this.httpClient.get<DocumentoSinArchivo[]>(this.apiUrl);
    }

    // Obtener documento por ID
    getDocumento(id: number): Observable<Documento> {
        return this.httpClient.get<Documento>(`${this.apiUrl}/${id}`);
    }

    // Crear nuevo documento
    createDocumento(documento: Documento): Observable<Documento> {
        return this.httpClient.post<Documento>(this.apiUrl, documento, this.httpOptions);
    }

    // Actualizar documento existente
    //updateDocumento(id: number, documento: Documento): Observable<Documento> {
    //    return this.httpClient.put<Documento>(`${this.apiUrl}/${id}`, documento, this.httpOptions);
    //}
    
    // Eliminar documento
    deleteDocumento(id: number): Observable<void> {
        return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
    }

    // Obtener documentos por cliente RUT
    getDocumentosByCliente(clienteRut: string): Observable<DocumentoSinArchivo[]> {
        return this.httpClient.get<DocumentoSinArchivo[]>(`${this.apiUrl}/cliente/${clienteRut}`);
    }
}