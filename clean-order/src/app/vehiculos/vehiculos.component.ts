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
  ngOnInit() {
    this.vehiculoService.listar().subscribe({
      next: (data) => {
        this.vehiculos = data;
      },
      error: (err) => console.error('Error cargando vehículos', err),
    });
  }

  agregarVehiculo(nuevoVehiculo: vehiculo) {
    this.vehiculos.push(nuevoVehiculo);
    console.log('Vehículo agregado:', nuevoVehiculo);
  }
}
