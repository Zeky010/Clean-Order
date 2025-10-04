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
      rut: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(8), Validators.pattern(/^[0-9]+$/)]],
      dv: ['', [Validators.required, Validators.pattern(/^[0-9Kk]$/), Validators.minLength(1), Validators.maxLength(1)]],
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
        dv: this.empleado.dv,
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
      this.empleadoForm.get('activo')?.disable();
      this.empleadoForm.get('idComuna')?.disable(); // opcional si quieres bloquear todo
      const formValue = this.empleadoForm.getRawValue();
      const empleadoData: Empleado = {
        rut: formValue.rut,
        dv: formValue.dv,
        nombre: formValue.nombre.trim(),
        apellido: formValue.apellido.trim(),
        direccion: formValue.direccion.trim(),
        telefono: formValue.telefono.trim(),
        idComuna: Number(formValue.idComuna),
        activo: formValue.activo
      };
      
      this.formSubmit.emit(empleadoData);
    } else {
      this.empleadoForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  resetForm(): void {
    this.isSubmitting = false;
    this.empleadoForm.enable(); // re-activa todos
    this.empleadoForm.reset({ activo: 'S' });
  }

  onCheckboxChange(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.empleadoForm.get('activo')?.setValue(isChecked ? 'S' : 'N');
  }
}
