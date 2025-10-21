import { Component, inject, OnInit } from '@angular/core';
import { vehiculo } from './vehiculo.types';
import { VehiculoForm } from './vehiculo-form/vehiculo-form.component';
import { VehiculoService } from './vehiculo.service';

@Component({
  selector: 'app-vehiculos',
  imports: [VehiculoForm],
  templateUrl: './vehiculos.component.html',
  styleUrls: [
    './vehiculos.component.css',
    '../shared/styles/entity-table.css',
    '../shared/styles/buttons.css',
  ],
})
export class VehiculosComponent implements OnInit {
  private readonly vehiculoService = inject(VehiculoService);

  vehiculos: vehiculo[] = [];
  loading = false;
  error = '';

  showCreateForm = false;
  showEditForm = false;
  selectedVehiculo: vehiculo | null = null;

  ngOnInit() {
    this.loading = true;
    this.vehiculoService.listar().subscribe({
      next: (data) => {
        this.vehiculos = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando vehículos', err);
        this.error = 'Error cargando vehículos';
        this.loading = false;
      },
    });
  }

  crearVehiculo() {
    this.showCreateForm = true;
    this.showEditForm = false;
    this.selectedVehiculo = null;
  }

  editarVehiculo(v: vehiculo) {
    this.showEditForm = true;
    this.showCreateForm = false;
    this.selectedVehiculo = { ...v }; // evita mutaciones
  }

  onCreateSubmit(payload: vehiculo) {
    this.loading = true;
    this.vehiculoService.crear(payload).subscribe({
      next: (created) => {
        this.vehiculos = [created, ...this.vehiculos];
        this.onCancelForm();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error creando vehículo', err);
        this.error = 'Error creando vehículo';
        this.loading = false;
      },
    });
  }

  onEditSubmit(payload: vehiculo) {
    const originalPatente = this.selectedVehiculo?.patente ?? payload.patente;
    this.loading = true;
    this.vehiculoService.actualizar(originalPatente, payload).subscribe({
      next: (updated) => {
        const idx = this.vehiculos.findIndex((v) => v.patente === originalPatente);
        if (idx !== -1) {
          const copia = [...this.vehiculos];
          copia[idx] = updated;
          this.vehiculos = copia;
        }
        this.onCancelForm();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error actualizando vehículo', err);
        this.error = 'Error actualizando vehículo';
        this.loading = false;
      },
    });
  }

  onCancelForm() {
    this.showCreateForm = false;
    this.showEditForm = false;
    this.selectedVehiculo = null;
  }

  agregarVehiculo(nuevoVehiculo: vehiculo) {
    this.vehiculos.push(nuevoVehiculo);
    console.log('Vehículo agregado:', nuevoVehiculo);
  }
}
