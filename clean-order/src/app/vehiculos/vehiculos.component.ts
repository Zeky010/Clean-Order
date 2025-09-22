import { Component } from '@angular/core';
import { Vehiculo } from './vehiculo.types';
import { VehiculoForm } from "./vehiculo-form/vehiculo-form.component";

@Component({
  selector: 'app-vehiculos',
  imports: [VehiculoForm],
  templateUrl: './vehiculos.component.html',
  styleUrls: ['./vehiculos.component.css']
})
export class VehiculosComponent {
  vehiculos: Vehiculo[] = [
    { patente: 'ABC123', capacidad: 5, tipo: 'Camioneta', idTipo: 1 },
    { patente: 'XYZ789', capacidad: 2, tipo: 'Sedan', idTipo: 2 },
    { patente: 'JKL456', capacidad: 4, tipo: 'SUV', idTipo: 3 }
  ];
  agregarVehiculo(nuevoVehiculo: Vehiculo) {
    this.vehiculos.push(nuevoVehiculo);
    console.log('Vehículo agregado:', nuevoVehiculo);
  }

}
