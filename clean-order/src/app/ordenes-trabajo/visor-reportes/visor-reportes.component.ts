import { Component, OnInit, inject, Input, Output, EventEmitter } from '@angular/core';
import { DatePipe } from '@angular/common';
import { VisorReportesService } from './visor-reportes.service';
import { Reporte, imagenReporte } from './reporte.types';
import { OrdenTrabajo } from '../ordenes-trabajo.types';

@Component({
  selector: 'app-visor-reportes',
  standalone: true,
  templateUrl: './visor-reportes.component.html',
  imports: [DatePipe],
  styleUrls: ['./visor-reportes.component.css',
  '../../shared/styles/buttons.css',
  '../../shared/styles/entity-table.css']
})
export class VisorReportesComponent implements OnInit {
  @Input({required: true}) orden!: OrdenTrabajo;
  @Output() closed = new EventEmitter<void>();
  private visorReportesService: VisorReportesService = inject(VisorReportesService);
  public reportesInicio: Reporte | null = null;
  public reportesFin: Reporte | null = null; 

  public loading = false;  

  // Mantenemos referencias para poder revocar URLs si lo deseas más adelante
  private objectUrls: string[] = [];

  ngOnInit() {
    this.loading = true;
    this.visorReportesService.getReportes(this.orden.id!).subscribe({
      next: (reportes) => {
        this.reportesInicio = reportes.find(reporte => reporte.tipoReporte.codigo == 1) ?? null;
        this.reportesFin = reportes.find(reporte => reporte.tipoReporte.codigo == 2) ?? null;
      },
      error: (error) => {
        console.error('Error al cargar los reportes:', error);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  getEstadoClass(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'agendado':
        return 'status-pending';
      case 'en proceso':
        return 'status-in-progress';
      case 'realizado':
        return 'status-completed';
      case 'suspendido':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  }

  getImageUrl(img: imagenReporte): string {
    // Si ya tienes una URL en el backend, usa esa propiedad en lugar de crear objectURL
    const url = URL.createObjectURL(img.imagen);
    this.objectUrls.push(url);
    return url;
  }

}
