import { Component, EventEmitter, Input, inject, OnChanges, Output, SimpleChanges } from '@angular/core';
import { VehiculoService } from '../../../vehiculos/vehiculo.service';
import { vehiculo } from '../../../vehiculos/vehiculo.types';

@Component({
  selector: 'app-lista-asignacion-vehiculo',
  standalone: true,
  templateUrl: './lista-asignacion-vehiculo.component.html',
  styleUrls: ['./lista-asignacion-vehiculo.component.css']
})
export class ListaAsignacionVehiculoComponent implements OnChanges {
  private vehiculoService: VehiculoService = inject(VehiculoService);
  @Input() fechaAgendada?: string | null = null;
  @Input() horasTrabajo?: number | null = null;

  // Permite inicializar/recibir el vehículo asignado desde el padre
  @Input() vehiculoAsignado: vehiculo | null = null;
  // Notifica cambios al padre
  @Output() vehiculoAsignadoChange = new EventEmitter<vehiculo | null>();

  loading = false;
  disponibles: vehiculo[] = [];
  seleccionado: vehiculo | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['fechaAgendada'] || changes['horasTrabajo']) && this.fechaAgendada && this.horasTrabajo) {
      this.cargarDisponibles();
    }
    if (changes['vehiculoAsignado']) {
      this.seleccionado = this.vehiculoAsignado ?? null;
    }
  }

  private cargarDisponibles(): void {
    this.loading = true;
    const isoDate = this.toIsoString(this.fechaAgendada!);
    this.vehiculoService.listarDisponibles(isoDate, this.horasTrabajo!).subscribe({
      next: (data) => {
        this.disponibles = data ?? [];
        this.loading = false;
      },
      error: () => {
        this.disponibles = [];
        this.loading = false;
      }
    });
  }

  agregar(v: vehiculo): void {
    // Solo 1 vehículo asignado -> reemplaza selección previa
    this.seleccionado = v;
    this.vehiculoAsignadoChange.emit(this.seleccionado);
  }

  quitar(): void {
    this.seleccionado = null;
    this.vehiculoAsignadoChange.emit(this.seleccionado);
  }

  isVehiculoSelected(patente: string): boolean {
    return !!this.seleccionado && this.seleccionado.patente === patente;
  }

  private toIsoString(localDT: string): string {
    // datetime-local -> ISO (asumiendo zona local)
    const d = new Date(localDT);
    return d.toISOString();
  }

}

