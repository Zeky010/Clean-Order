import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Cliente } from '../clientes.types';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
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
      rut: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(8), Validators.pattern(/^[0-9]+$/)]],
      dv: ['', [Validators.required, Validators.pattern(/^[0-9Kk]$/)]],
      razonSocial: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required,Validators.email]],
      telefono: ['', [Validators.pattern(/^(\+?56)?[0-9]{8,9}$/)]],
      activo: [true]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cliente'] || changes['isEditMode']) {
      if (this.cliente) {
        this.clienteForm.patchValue({
          rut: this.cliente.rut,
          dv: this.cliente.dv.toUpperCase(),
          razonSocial: this.cliente.razonSocial,
          correo: this.cliente.correo,
          telefono: this.cliente.telefono || '',
          activo: this.cliente.activo === 'S'
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
      rut: raw.rut.toUpperCase(),
      dv: raw.dv.toUpperCase(),
      razonSocial: raw.razonSocial.trim(),
      correo: raw.correo || '',
      telefono: raw.telefono ? raw.telefono.trim() : undefined,
      activo: raw.activo ? 'S' : 'N'
    };
    this.save.emit(payload);
    this.isSubmitting = false;
  }

  onCancel(): void {
    this.canceled.emit();
  }
}
