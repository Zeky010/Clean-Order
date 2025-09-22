import { Component, Output, EventEmitter } from '@angular/core';
import { Vehiculo } from '../vehiculo.types';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-vehiculo-form',
  templateUrl: './vehiculo-form.component.html',
  styleUrls: ['./vehiculo-form.component.css'],
  imports: [FormsModule]
})
export class VehiculoForm {
  @Output() vehiculoCreado = new EventEmitter<Vehiculo>();

  nuevoVehiculo: Vehiculo = {
    patente: '',
    capacidad: 0,
    tipo: '',
    idTipo: 0
  };

  crearVehiculo() {
    this.vehiculoCreado.emit({...this.nuevoVehiculo});
    console.log('Vehículo creado:', this.nuevoVehiculo);
    // Opcional: limpiar el formulario
    this.nuevoVehiculo = { patente: '', capacidad: 0, tipo: '', idTipo: 0 };
  }
}
