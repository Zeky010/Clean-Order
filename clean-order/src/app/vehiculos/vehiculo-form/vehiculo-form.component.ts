import { Component, Output, EventEmitter, inject } from '@angular/core';
import { vehiculo, tipoCarga } from '../vehiculo.types';
import { FormsModule } from '@angular/forms';
import { VehiculoService } from '../vehiculo.service';
import { TipoCargaService } from './tipo-carga.service';

@Component({
  selector: 'app-vehiculo-form',
  templateUrl: './vehiculo-form.component.html',
  styleUrls: [
    './vehiculo-form.component.css',
    '../../shared/styles/buttons.css',
    '../../shared/styles/forms.css'
  ],
  imports: [FormsModule],
})
export class VehiculoForm {
  @Output() vehiculoCreado = new EventEmitter<vehiculo>();
  private readonly tipoCargaService = inject(TipoCargaService);
  private readonly vehiculoService = inject(VehiculoService);

  tiposCarga: tipoCarga[] = [];
  // Modelo del formulario
  nuevoVehiculo: vehiculo = {
    patente: '',
    capacidad: 0,
    activo: 'S',
    TipoCarga: { id: 0, nombreCarga: '' }
  };
  selectedTipoCargaId: number | null = null;

  ngOnInit() {
    this.tipoCargaService.listar().subscribe({
      next: (data) => {
        this.tiposCarga = data;
        // Selección por defecto
        if (!this.selectedTipoCargaId && this.tiposCarga.length) {
          this.selectedTipoCargaId = this.tiposCarga[0].id;
        }
      },
      error: (err) => console.error('Error cargando tipos de carga', err),
    });
  } 

  crearVehiculo() {
    // Mapear el id seleccionado al objeto TipoCarga
    const tipo = this.tiposCarga.find(t => t.id === this.selectedTipoCargaId!);
    if (!tipo) {
      console.error('Tipo de carga no seleccionado');
      return;
    }

    const payload: vehiculo = {
      patente: this.nuevoVehiculo.patente.trim(),
      capacidad: this.nuevoVehiculo.capacidad,
      activo: this.nuevoVehiculo.activo,
      TipoCarga: tipo
    };

    this.vehiculoService.crear(payload).subscribe({
      next: (created) => {
        this.vehiculoCreado.emit(created);
        // Reset del formulario
        this.nuevoVehiculo = {
          patente: '',
          capacidad: 0,
          activo: 'S',
          TipoCarga: { id: 0, nombreCarga: '' }
        };
        this.selectedTipoCargaId = this.tiposCarga.length ? this.tiposCarga[0].id : null;
      },
      error: (err) => console.error('Error creando vehículo', err),
    });
  }
}
