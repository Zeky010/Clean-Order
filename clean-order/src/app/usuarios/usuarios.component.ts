import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Usuario } from './usuario.types';
import { UsuarioService } from './usuarios.service';
import { UsuarioFormComponent } from './usuario-form/usuario-form.component';

@Component({
  selector: 'app-usuarios',
  imports: [CommonModule, UsuarioFormComponent],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuarioComponent implements OnInit {

  private usuarioService = inject(UsuarioService);
  usuarios: Usuario[] = [];
  showForm = false;
  selectedUsuario?: Usuario;
  isEditMode = false;

  ngOnInit(): void {
    this.loadUsuarios();
  }

  loadUsuarios(): void {
    this.usuarioService.getUsuarios().subscribe(data => {
      this.usuarios = data;
    });
  }

  editarUsuario(usuario: Usuario): void {
    this.selectedUsuario = usuario;
    this.isEditMode = true;
    this.showForm = true;
  }

  crearUsuario(): void {
    this.selectedUsuario = undefined;
    this.isEditMode = false;
    this.showForm = true;
  }

  onFormSubmit(usuarioData: Partial<Usuario>): void {
    if (this.isEditMode && this.selectedUsuario) {
      // Update existing usuario
      this.usuarioService.updateUsuario(this.selectedUsuario.id, usuarioData).subscribe({
        next: () => {
          this.loadUsuarios();
          this.closeForm();
        },
        error: (error) => console.error('Error updating usuario:', error)
      });
    } else {
      // Create new usuario
      this.usuarioService.createUsuario(usuarioData as Omit<Usuario, 'id'>).subscribe({
        next: () => {
          this.loadUsuarios();
          this.closeForm();
        },
        error: (error) => console.error('Error creating usuario:', error)
      });
    }
  }

  closeForm(): void {
    this.showForm = false;
    this.selectedUsuario = undefined;
    this.isEditMode = false;
  }
}
