import { Component, OnInit, inject, Input, Output, EventEmitter } from '@angular/core';
import { DatePipe } from '@angular/common';
import { VisorReportesService } from './visor-reportes.service';
import { ReporteDetalle, imagenReporte } from './reporte.types';
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
  public reportesInicio: ReporteDetalle | null = null;
  public reportesFin: ReporteDetalle | null = null; 

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
    // Build a data URL from Base64
    if (!img?.imagenBase64) return '';
    const mime = img.tipoMime || 'image/jpeg';
    return `data:${mime};base64,${img.imagenBase64}`;
  }

}
