import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Region } from './comuna-region.types';

@Injectable({
  providedIn: 'root'
})
export class RegionService {
  private apiUrl = 'https://localhost:7226/Region'; // Base API URL
  private httpClient: HttpClient = inject(HttpClient);

  // Get all regions
  getRegions(): Observable<Region[]> {
    return this.httpClient.get<Region[]>(`${this.apiUrl}`);
  }

  // Get region by ID
  getRegionById(id: number): Observable<Region> {
    return this.httpClient.get<Region>(`${this.apiUrl}/${id}`);
  }
  getRegionByComunaId(comunaId: number): Observable<Region> {
    return this.httpClient.get<Region>(`${this.apiUrl}/GetByComunaId/${comunaId}`);
  }
}