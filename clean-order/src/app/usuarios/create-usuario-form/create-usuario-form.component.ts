import { Component, inject, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsuarioCreation } from '../usuario.types';
import { RolesService } from '../roles.service';
import { Rol } from '../roles.types';

@Component({
  selector: 'app-create-usuario-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-usuario-form.component.html',
  styleUrls: ['./create-usuario-form.component.css', '../../shared/forms.css'],
})
export class CreateUsuarioFormComponent implements OnInit {
  @Output() formSubmit = new EventEmitter<UsuarioCreation>();
  @Output() formCancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private rolesService = inject(RolesService);
  
  roles: Rol[] = [];

  usuarioForm: FormGroup = this.fb.group({
    correo: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    repeatPassword: ['', [Validators.required]],
    rolId: [null, Validators.required],
    activo: 0
  }, { validators: this.passwordMatchValidator });

  ngOnInit(): void {
    this.loadRoles();
  }

  private passwordMatchValidator(control: AbstractControl): Record<string, unknown> | null {
    const password = control.get('password');
    const repeatPassword = control.get('repeatPassword');
    
    if (password && repeatPassword && password.value !== repeatPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  loadRoles(): void {
    this.rolesService.getRoles().subscribe({
      next: (data) => this.roles = data,
      error: (err) => console.error('Error cargando roles:', err)
    });
  }

  onSubmit(): void {
    if (this.usuarioForm.valid) {
      const formData = this.usuarioForm.value;
      const createData: UsuarioCreation = {
        correo: formData.correo,
        rolId: Number(formData.rolId),
        password: formData.password,
        activo: formData.activo ? 1 : 0
      };
      this.formSubmit.emit(createData);
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  get isPasswordMismatch(): boolean {
    return this.usuarioForm.errors?.['passwordMismatch'] && 
           this.usuarioForm.get('repeatPassword')?.touched || false;
  }
}