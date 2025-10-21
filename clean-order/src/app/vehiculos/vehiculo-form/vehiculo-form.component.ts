import { Component, Output, EventEmitter, inject, OnInit, Input } from '@angular/core';
import { vehiculo, tipoCarga } from '../vehiculo.types';
import { FormsModule } from '@angular/forms';
import { TipoCargaService } from './tipo-carga.service';

@Component({
  selector: 'app-vehiculo-form',
  templateUrl: './vehiculo-form.component.html',
  styleUrls: [
    './vehiculo-form.component.css',
    '../../shared/styles/buttons.css',
    '../../shared/styles/forms.css'
  ],
  imports: [ FormsModule],
})
export class VehiculoForm implements OnInit {
  // Campo de respaldo para el @Input vehiculo
  private _vehiculo?: vehiculo;

  @Input() set vehiculo(value: vehiculo | undefined) {
    this._vehiculo = value;
    if (value) {
      this.nuevoVehiculo = { ...value };
      this.selectedTipoCargaId = value.tipoCarga?.id ?? null;
      this.activoChecked = value.activo === 'S';
    } else {
      this.nuevoVehiculo = {
        patente: '',
        capacidad: 0,
        activo: 'S',
        tipoCarga: { id: 0, nombreCarga: '' }
      };
      this.selectedTipoCargaId = null;
      this.activoChecked = true;
    }
  }
  get vehiculo(): vehiculo | undefined {
    return this._vehiculo;
  }

  @Output() formSubmit = new EventEmitter<vehiculo>();
  @Output() formCancel = new EventEmitter<void>();

  private readonly tipoCargaService = inject(TipoCargaService);

  tiposCarga: tipoCarga[] = [];
  // Modelo del formulario
  nuevoVehiculo: vehiculo = {
    patente: '',
    capacidad: 0,
    activo: 'S',
    tipoCarga: { id: 0, nombreCarga: '' }
  };
  selectedTipoCargaId: number | null = null;
  activoChecked = true;

  get isEditMode() {
    return !!this.vehiculo;
  }

  ngOnInit() {
    this.tipoCargaService.listar().subscribe({
      next: (data) => {
        this.tiposCarga = data;
        // No autoseleccionar: forzar que el usuario elija
        // if (!this.isEditMode && !this.selectedTipoCargaId && this.tiposCarga.length) {
        //   this.selectedTipoCargaId = this.tiposCarga[0].id;
        // }
      },
      error: (err) => console.error('Error cargando tipos de carga', err),
    });
  }

  crearVehiculo() {
    const tipo = this.tiposCarga.find(t => t.id === this.selectedTipoCargaId!);
    if (!tipo) {
      console.error('Tipo de carga no seleccionado');
      return;
    }

    const patente = this.isEditMode ? (this.vehiculo?.patente ?? '') : this.nuevoVehiculo.patente.trim();

    const payload: vehiculo = {
      patente,
      capacidad: this.nuevoVehiculo.capacidad,
      activo: this.activoChecked ? 'S' : 'N',
      tipoCarga: tipo
    };
    this.formSubmit.emit(payload);
  }

  cancelar() {
    this.formCancel.emit();
  }
}
