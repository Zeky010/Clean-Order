import { Component, inject, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Usuario } from '../usuario.types';

@Component({
  selector: 'app-usuario-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuario-form.component.html',
  styleUrl: './usuario-form.component.css'
})
export class UsuarioFormComponent implements OnInit {
  @Input() usuario?: Usuario; // For editing existing usuario
  @Input() isEditMode = false;
  @Output() formSubmit = new EventEmitter<Partial<Usuario>>();
  @Output() formCancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  
  usuarioForm: FormGroup = this.fb.group({
    correo: ['', [Validators.required, Validators.email]],
    rol: ['', Validators.required],
    rolId: [null, Validators.required],
    activo: [true]
  });

  ngOnInit(): void {
    if (this.isEditMode && this.usuario) {
      this.usuarioForm.patchValue({
        correo: this.usuario.correo,
        rol: this.usuario.rol,
        rolId: this.usuario.rolId,
        activo: this.usuario.activo
      });
    }
  }

  onSubmit(): void {
    if (this.usuarioForm.valid) {
      const formData = this.usuarioForm.value;
      
      if (this.isEditMode && this.usuario) {
        // Include the ID for updates
        this.formSubmit.emit({ ...formData, id: this.usuario.id });
      } else {
        // New usuario (no ID needed)
        this.formSubmit.emit(formData);
      }
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  get title(): string {
    return this.isEditMode ? 'Editar Usuario' : 'Crear Usuario';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'Actualizar' : 'Crear';
  }
}
