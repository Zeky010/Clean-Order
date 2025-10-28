import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdenesTrabajoService } from '../../ordenes-trabajo.service';
import { empleadoAsignar } from '../orden-form.type';

@Component({
  selector: 'app-lista-asignacion-empleado',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-asignacion-empleado.component.html',
  styleUrls: ['./lista-asignacion-empleado.component.css']
})
export class ListaAsignacionEmpleadoComponent implements OnChanges {
  @Input() fechaAgendada: string | null = null; // formato input datetime-local
  @Input() horasTrabajo: number | null = null;
  @Input() preseleccion: empleadoAsignar[] = [];
  @Output() empleadosSeleccionChange = new EventEmitter<empleadoAsignar[]>();

  private service = inject(OrdenesTrabajoService);

  disponibles: empleadoAsignar[] = [];
  seleccionados: empleadoAsignar[] = [];
  loading = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fechaAgendada'] || changes['horasTrabajo']) {
      this.tryLoadDisponibles();
    }
    if (changes['preseleccion'] && this.preseleccion?.length && this.seleccionados.length === 0) {
      this.seleccionados = [...this.preseleccion];
      this.emit();
    }
  }

  private tryLoadDisponibles(): void {
    if (!this.fechaAgendada || !this.horasTrabajo) return;
    this.loading = true;
    const iso = this.toIsoString(this.fechaAgendada);
    this.service.getEmpleadosDisponibles(iso, this.horasTrabajo).subscribe({
      next: (lista: empleadoAsignar[]) => {
        this.disponibles = lista || [];
        this.loading = false;
      },
      error: e => { this.disponibles = []; this.loading = false;

        switch (e.status) {
          case 400:
            alert('Parámetros inválidos para obtener empleados disponibles.');
            break;
          case 500:
            alert('Error del servidor al obtener empleados disponibles.');
            break;
          default:
            alert('Error desconocido al obtener empleados disponibles.');

       }
    },
    });
  }

  private toIsoString(localDT: string): string {
    // datetime-local -> ISO (asumiendo zona local)
    const d = new Date(localDT);
    return d.toISOString();
  }

  agregar(e: empleadoAsignar): void {
    if (this.seleccionados.find(x => x.rut === e.rut)) return;
    this.seleccionados.push(e);
    this.emit();
  }

  quitar(e: empleadoAsignar): void {
    this.seleccionados = this.seleccionados.filter(x => x.rut !== e.rut);
    this.emit();
  }

  isEmpleadoSelected(rut: string): boolean {
    return !!this.seleccionados.find(e => e.rut === rut);
  }

  private emit(): void {
    this.empleadosSeleccionChange.emit(this.seleccionados);
  }
}
