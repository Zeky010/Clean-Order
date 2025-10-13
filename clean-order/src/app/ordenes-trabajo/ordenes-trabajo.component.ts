import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { OrdenTrabajo } from './ordenes-trabajo.types';
import { OrdenesTrabajoService } from './ordenes-trabajo.service';
import { OrdenFormComponent } from './orden-form/orden-form.component';
import { OrdenForm } from './orden-form/orden-form.type';

@Component({
  selector: 'app-ordenes-trabajo',
  standalone: true,
  templateUrl: './ordenes-trabajo.component.html',
  styleUrls: ['./ordenes-trabajo.component.css', '../shared/entity-table.css', 
              '../shared/forms.css', '../shared/buttons.css'],
  imports: [DatePipe, OrdenFormComponent]
})
export class OrdenesTrabajoComponent implements OnInit {
  ordenesTrabajos: OrdenTrabajo[] = [];
  selectedOrden: OrdenTrabajo | null = null;
  loading = true;
  error: string | null = null;
  
  // Estados para mostrar formularios/detalles
  showCreateForm = false;
  showEditForm = false;
  showOrdenDetalle = false;
  isEditMode = false;

  private ordenesTrabajoService = inject(OrdenesTrabajoService);

  ngOnInit(): void {
    this.loadOrdenesTrabajo();
  }

  loadOrdenesTrabajo(): void {
    this.loading = true;
    this.error = null;
    
    this.ordenesTrabajoService.getOrdenesTrabajo().subscribe({
      next: (ordenes) => {
        this.ordenesTrabajos = ordenes;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading órdenes:', error);
        this.error = 'No se pudieron cargar las órdenes de trabajo';
        this.loading = false;
        this.handleError(error, 'cargar órdenes de trabajo');
      }
    });
  }

  crearOrdenTrabajo(): void {
    this.closeForms();
    this.selectedOrden = null;
    this.isEditMode = false;
    this.showCreateForm = true;
  }

  editarOrden(orden: OrdenTrabajo): void {
    this.closeForms();
    this.selectedOrden = orden;
    this.isEditMode = true;
    this.showEditForm = true;
  }

  verDetalles(orden: OrdenTrabajo): void {
    this.closeForms();
    this.selectedOrden = orden;
    this.showOrdenDetalle = true;
  }


  onCreateSubmit(ordenForm: OrdenForm): void {
    this.ordenesTrabajoService.createOrdenTrabajo(ordenForm).subscribe({
      next: () => {
        this.closeForms();
        this.loadOrdenesTrabajo();
      },
      error: (error) => this.handleError(error, 'crear')
    });
  }

  onEditSubmit(ordenForm: OrdenForm): void {
    if (!this.selectedOrden) return;
    this.ordenesTrabajoService.updateOrdenTrabajo(this.selectedOrden.id, ordenForm).subscribe({
      next: () => {
        this.closeForms();
        this.loadOrdenesTrabajo();
      },
      error: (error) => this.handleError(error, 'actualizar')
    });
  }

  onCancelForm(): void {
    this.closeForms();
  }

  // Método para eliminar orden (si lo necesitas)
  suspenderOrden(orden: OrdenTrabajo): void {
    if (!this.canSuspender(orden)) {
      alert('Solo se puede suspender una orden en estado Agendada.');
      return;
    }
    if (confirm(`¿Está seguro de suspender la orden ${orden.folio}?`)) {
      this.ordenesTrabajoService.suspenderOrden(orden.id).subscribe({
        next: () => {
          console.log('Orden suspendida exitosamente');
          this.loadOrdenesTrabajo();
        },
        error: (error) => {
          this.handleError(error, 'suspender');
        }
      });
    }
  }

  // Métodos para cambiar estado
  cambiarEstado(orden: OrdenTrabajo, nuevoEstadoId: number): void {
    this.ordenesTrabajoService.cambiarEstado(orden.id, nuevoEstadoId).subscribe({
      next: (ordenActualizada) => {
        console.log('Estado cambiado exitosamente:', ordenActualizada);
        this.loadOrdenesTrabajo();
      },
      error: (error) => {
        this.handleError(error, 'cambiar estado');
      }
    });
  }

  // Método para reagendar
  reagendarOrden(orden: OrdenTrabajo, nuevaFecha: string): void {
    this.ordenesTrabajoService.reagendarOrden(orden.id, nuevaFecha).subscribe({
      next: (ordenReagendada) => {
        console.log('Orden reagendada exitosamente:', ordenReagendada);
        this.loadOrdenesTrabajo();
      },
      error: (error) => {
        this.handleError(error, 'reagendar');
      }
    });
  }

  // Métodos para filtros
  filtrarPorCliente(idCliente: number): void {
    this.loading = true;
    this.ordenesTrabajoService.getOrdenesByCliente(idCliente).subscribe({
      next: (ordenes) => {
        this.ordenesTrabajos = ordenes;
        this.loading = false;
      },
      error: (error) => {
        this.handleError(error, 'filtrar por cliente');
        this.loading = false;
      }
    });
  }

  // filtrarPorEstado(idEstado: number): void {
  //   this.loading = true;
  //   this.ordenesTrabajoService.getOrdenesByEstado(idEstado).subscribe({
  //     next: (ordenes) => {
  //       this.ordenesTrabajos = ordenes;
  //       this.loading = false;
  //     },
  //     error: (error) => {
  //       this.handleError(error, 'filtrar por estado');
  //       this.loading = false;
  //     }
  //   });
  // }

  filtrarPorFechas(fechaInicio: string, fechaFin: string): void {
    this.loading = true;
    this.ordenesTrabajoService.getOrdenesByFechas(fechaInicio, fechaFin).subscribe({
      next: (ordenes) => {
        this.ordenesTrabajos = ordenes;
        this.loading = false;
      },
      error: (error) => {
        this.handleError(error, 'filtrar por fechas');
        this.loading = false;
      }
    });
  }

  // Métodos auxiliares
  closeForms(): void {
    this.showCreateForm = false;
    this.showEditForm = false;
    this.showOrdenDetalle = false;
    this.isEditMode = false;
    this.selectedOrden = null;
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

  // Método helper para saber si la orden está en estado 1 (agendada)
  canSuspender(orden: OrdenTrabajo): boolean {
    
    return orden.idEstado === 1;
  }

  private handleError(error: unknown, accion: string): void {
    const status = (error as { status?: number })?.status;
    switch (status) {
      case 0:
        alert('No se pudo conectar al servidor');
        break;
      case 400:
        alert(`Datos inválidos al ${accion}.`);
        break;
      case 401:
        alert('No autorizado. Por favor, inicie sesión.');
        break;
      case 404:
        alert('Orden de trabajo no encontrada.');
        break;
      case 409:
        alert('Conflicto al procesar la solicitud.');
        break;
      case 500:
        alert('Error interno del servidor.');
        break;  
      default:
        alert(`Error al ${accion}.`);
    }
    console.error(`Error ${accion}:`, error);
  }
}
