import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Empleado } from './empleado.types';
import { EmpleadoService } from './empleado.service';
import { EmpleadoFormComponent } from './empleado-form/empleado-form.component';

@Component({
  selector: 'app-empleados',
  imports: [CommonModule, EmpleadoFormComponent],
  templateUrl: './empleados.component.html',
  styleUrls: ['./empleados.component.css', '../shared/entity-table.css']
})
export class EmpleadosComponent implements OnInit {
  empleados: Empleado[] = [];
  loading = true;
  error: string | null = null;
  showCreateForm = false;
  showEditForm = false;
  selectedEmpleado: Empleado | null = null;

  private empleadoService = inject(EmpleadoService);

  ngOnInit(): void {
    this.loadEmpleados();
  }

  loadEmpleados(): void {
    this.loading = true;
    this.error = null;
    this.empleadoService.getEmpleados().subscribe({
      next: (data) => {
        this.empleados = data;
        this.loading = false;
      },
      error: (err) => {
        switch (err.status) {
          case 0:
            this.error = 'No se pudo conectar al servidor';
            break;
          case 404:
            this.error = 'Empleados no encontrados';
            break;
          case 500:
            this.error = 'Error interno del servidor';
            break;
          default:
            this.error = 'Error cargando empleados';
        }
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }

  crearEmpleado(): void {
    this.selectedEmpleado = null;
    this.showEditForm = false;
    this.showCreateForm = true;
  }

  editarEmpleado(empleado: Empleado): void {
    this.selectedEmpleado = empleado;
    this.showCreateForm = false;
    this.showEditForm = true;
  }

  onCreateSubmit(empleado: Empleado): void {
    // dv is not entered in the form; backend may compute it. Provide placeholder if required.
    const payload: Empleado = { ...empleado, dv: empleado.dv ?? '' };
    this.empleadoService.createEmpleado(payload).subscribe({
      next: () => {
        this.closeForms();
        this.loadEmpleados();
      },
      error: (err) => this.handleMutationError(err, 'crear')
    });
  }

  onEditSubmit(empleado: Empleado): void {
    if (!this.selectedEmpleado) return;
    const payload: Empleado = { ...empleado, rut: this.selectedEmpleado.rut, dv: this.selectedEmpleado.dv };
    this.empleadoService.updateEmpleado(payload).subscribe({
      next: () => {
        this.closeForms();
        this.loadEmpleados();
      },
      error: (err) =>{
        this.handleMutationError(err, 'actualizar');

      } 
    });
  }

  onCancelForm(): void {
    this.closeForms();
  }

  private closeForms(): void {
    this.showCreateForm = false;
    this.showEditForm = false;
    this.selectedEmpleado = null;
  }

  private handleMutationError(err: unknown, accion: string) {
    const status = (err as { status?: number })?.status;
    switch (status) {
      case 0:
        alert('No se pudo conectar al servidor');
        break;
      case 400:
        alert(`Datos inválidos al ${accion} empleado.`);
        break;
      case 404:
        alert('Empleado no encontrado.');
        break;
      case 409:
        alert('Este rut ya está registrado.');
        break;
      case 500:
        alert('Error interno del servidor.');
        break;
      default:
        alert(`Error al ${accion} empleado.`);
    }
    console.error('Error mutación empleado:', err);
  }
}
