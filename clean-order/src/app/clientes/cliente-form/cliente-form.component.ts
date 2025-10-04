import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { Cliente } from '../clientes.types';

@Component({
  selector: 'app-cliente-form',
  imports: [ReactiveFormsModule],
  templateUrl: './cliente-form.component.html',
  styleUrls: ['./cliente-form.component.css']
})
export class ClienteFormComponent implements OnChanges {
  @Input() cliente: Cliente | null = null;
  @Input() isEditMode = false;
  @Output() save = new EventEmitter<Cliente>();
  @Output() canceled = new EventEmitter<void>();
  private fb: FormBuilder = inject(FormBuilder);
  clienteForm: FormGroup;
  isSubmitting = false;

  constructor() {
    this.clienteForm = this.fb.group({
      rut: ['', [Validators.required, Validators.pattern(/^\d{5,9}$/)]],
      dv: ['', [Validators.required, Validators.pattern(/^[0-9Kk]$/)]],
      razonSocial: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.email]],
      telefono: ['', [Validators.pattern(/^(\+?56)?[0-9]{8,9}$/)]],
      activo: [true]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cliente'] || changes['isEditMode']) {
      if (this.cliente) {
        this.clienteForm.patchValue({
          rut: this.cliente.Rut,
            dv: this.cliente.DV,
          razonSocial: this.cliente.RazonSocial,
          correo: this.cliente.Correo,
          telefono: this.cliente.Telefono || '',
          activo: this.cliente.Activo === 'S'
        });
      } else {
        this.clienteForm.reset({
          rut: '',
          dv: '',
          razonSocial: '',
          correo: '',
          telefono: '',
          activo: true
        });
      }
      if (this.isEditMode) {
        this.clienteForm.get('rut')?.disable();
        this.clienteForm.get('dv')?.disable();
      } else {
        this.clienteForm.get('rut')?.enable();
        this.clienteForm.get('dv')?.enable();
      }
    }
  }

  onSubmit(): void {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    const raw = this.clienteForm.getRawValue();
    const payload: Cliente = {
      Rut: raw.rut,
      DV: raw.dv.toUpperCase(),
      RazonSocial: raw.razonSocial.trim(),
      Correo: raw.correo || '',
      Telefono: raw.telefono ? raw.telefono.trim() : undefined,
      Activo: raw.activo ? 'S' : 'N'
    };
    this.save.emit(payload);
    this.isSubmitting = false;
  }

  onCancel(): void {
    this.canceled.emit();
  }
}
