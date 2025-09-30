import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comuna } from './comuna-region.types';

@Injectable({
  providedIn: 'root'
})
export class ComunaRegionService {
  private apiUrl = 'https://localhost:7226/Comuna/'; // Base API URL
  private httpClient: HttpClient = inject(HttpClient);

  // Get all comunas
  getComunas(): Observable<Comuna[]> {
    return this.httpClient.get<Comuna[]>(`${this.apiUrl}`);
  }

  // Get comunas by region ID
  getComunasByRegion(regionId: number): Observable<Comuna[]> {
    return this.httpClient.get<Comuna[]>(`${this.apiUrl}/ByRegion/${regionId}`);
  }

  // Get comuna by ID
  getComunaById(id: number): Observable<Comuna> {
    return this.httpClient.get<Comuna>(`${this.apiUrl}${id}`);
  }
}