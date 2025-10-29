import {
  Component,
  inject,
  Input,
  Output,
  EventEmitter,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Usuario, UsuarioUpdate } from '../usuario.types';
import { RolesService } from '../roles.service';
import { Rol } from '../roles.types';

@Component({
  selector: 'app-update-usuario-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-usuario-form.component.html',
  styleUrls: [
    './update-usuario-form.component.css',
    '../../shared/styles/forms.css',
    '../../shared/styles/buttons.css',
  ],
})
export class UpdateUsuarioComponent implements OnInit {
  @Input() usuario!: Usuario;
  @Output() formSubmit = new EventEmitter<UsuarioUpdate>();
  @Output() formCancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private rolesService = inject(RolesService);

  roles: Rol[] = [];

  usuarioForm: FormGroup = this.fb.group({
    rolId: [null, Validators.required],
    activo: [true],
  });

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.rolesService.getRoles().subscribe({
      next: (data) => {
        this.roles = data;
        this.setFormValues();
      },
      error: (err) => console.error('Error cargando roles:', err),
    });
  }

  private setFormValues(): void {
    this.usuarioForm.patchValue({
      rolId: this.usuario.rolId,
      activo: this.usuario.activo,
    });
  }

  onSubmit(): void {
    if (this.usuarioForm.valid) {
      const formValue = {
        ...this.usuarioForm.value,
        activo: this.usuarioForm.value.activo ? 1 : 0,
      };
      const updateData: UsuarioUpdate = {
        correo: this.usuario.correo,
        rolId: Number(formValue.rolId),
        activo: formValue.activo,
      };
      this.formSubmit.emit(updateData);
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }
}
