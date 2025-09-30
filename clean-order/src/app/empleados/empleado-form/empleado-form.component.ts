import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Empleado } from '../empleado.types';
import { ComunaRegionSelectorComponent } from '../../comuna-region/comuna-region-selector.component';

@Component({
  selector: 'app-empleado-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ComunaRegionSelectorComponent],
  templateUrl: './empleado-form.component.html',
  styleUrls: ['./empleado-form.component.css']
})
export class EmpleadoFormComponent implements OnInit, OnChanges {
  @Input() empleado: Empleado | null = null;
  @Output() formSubmit = new EventEmitter<Empleado>();
  @Output() formCancel = new EventEmitter<void>();

  empleadoForm: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  private fb = inject(FormBuilder);

  constructor() {
    this.empleadoForm = this.createForm();
  }

  ngOnInit(): void {
    this.isEditMode = !!this.empleado;
    if (this.empleado) {
      this.loadEmpleadoData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['empleado'] && this.empleado) {
      this.isEditMode = true;
      this.loadEmpleadoData();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      rut: ['', [Validators.required, Validators.min(1000000)]],
      nombre: ['', [Validators.required, Validators.minLength(1)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      direccion: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(/^(\+?56)?[0-9]{8,9}$/)]],
      idComuna: ['', Validators.required],
      // activo now string: 'S' (Sí) or 'N' (No)
      activo: ['S', [Validators.required, Validators.pattern(/^[SN]$/)]]
    });
  }

  private loadEmpleadoData(): void {
    if (this.empleado) {
      this.empleadoForm.patchValue({
        rut: this.empleado.rut,
        nombre: this.empleado.nombre,
        apellido: this.empleado.apellido,
        direccion: this.empleado.direccion,
        telefono: this.empleado.telefono,
        idComuna: this.empleado.idComuna,
        activo: this.empleado.activo // should already be 'S' or 'N'
      });
    }
  }

  onSubmit(): void {
    if (this.empleadoForm.valid) {
      this.isSubmitting = true;
      const formValue = this.empleadoForm.value;

      const empleadoData: Empleado = {
        rut: Number(formValue.rut),
        nombre: formValue.nombre.trim(),
        apellido: formValue.apellido.trim(),
        direccion: formValue.direccion.trim(),
        telefono: formValue.telefono.trim(),
        idComuna: Number(formValue.idComuna),
        activo: formValue.activo // string 'S' | 'N'
      };

      this.formSubmit.emit(empleadoData);
    } else {
      Object.keys(this.empleadoForm.controls).forEach(key => {
        this.empleadoForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  resetForm(): void {
    this.isSubmitting = false;
    this.empleadoForm.reset();
    this.empleadoForm.patchValue({ activo: 'S' });
  }
}
