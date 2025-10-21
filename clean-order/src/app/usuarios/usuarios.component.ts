import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Usuario, UsuarioCreation, UsuarioUpdate } from './usuario.types';
import { UsuarioService } from './usuarios.service';
import { CreateUsuarioFormComponent } from './create-usuario-form/create-usuario-form.component';
import { UpdateUsuarioComponent } from './update-usuario-form/update-usuario-form.component';
import { AsignarUsuarioComponent } from './asignar-usuario/asignar-usuario.component';

@Component({
  selector: 'app-usuarios',
  imports: [CommonModule, CreateUsuarioFormComponent, UpdateUsuarioComponent, AsignarUsuarioComponent],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css', '../shared/styles/entity-table.css'
              , '../shared/styles/buttons.css'] 
})
export class UsuarioComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  usuarios: Usuario[] = [];

  selectedUsuario?: Usuario;
  selectedUsuarioForAssign: Usuario | null = null;

  showCreateForm = false;
  showEditForm = false;
  showAssignForm = false;

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
    this.showEditForm = true;
  }

  crearUsuario(): void {
    this.showCreateForm = true;
  }

  asignarUsuario(usuario: Usuario): void {
    this.selectedUsuarioForAssign = usuario;
    this.showAssignForm = true;
  }

  onCreateSubmit(data: UsuarioCreation): void {
    this.usuarioService.createUsuario(data).subscribe({
      next: () => {
        this.loadUsuarios();
        this.closeCreateForm();
      },
      error: (error) =>{
        switch (error.status) {
          case 400:
            alert('Error: Usuario con este correo ya existe.');
            break;
          case 500:
            alert('Error del servidor. Por favor, inténtelo de nuevo más tarde.');
            break;
          default:
            console.error('Error creating usuario:', error);
        }
      },
    });
  }

  onEditSubmit(data: UsuarioUpdate): void {
    if (!this.selectedUsuario) {
      console.error('No selected usuario for update');
      return;
    }
    
    // Pass the selected usuario's ID
    this.usuarioService.updateUsuario(data).subscribe({
      next: () => {
        this.loadUsuarios();
        this.closeEditForm();
      },
      error: (error) => {
        switch (error.status) {
          case 400:
            alert('Error: Datos inválidos proporcionados.');
            break;
          case 404:
            alert("Error: Usuario no encontrado.");
            break;
          case 500:
            alert('Error del servidor. Por favor, inténtelo de nuevo más tarde.');
            break;
          default:
            console.error('Error updating usuario:', error);
        }

        if (error.status === 404) {
          alert("Error: Usuario no encontrado.");
        } 
      }
    });
  }

  closeCreateForm(): void {
    this.showCreateForm = false;
  }

  closeEditForm(): void {
    this.showEditForm = false;
    this.selectedUsuario = undefined;
  }

  closeAssignForm(): void {
    this.showAssignForm = false;
    this.selectedUsuarioForAssign = null;
  }

  onAssignSubmit(): void {
    this.closeAssignForm();
    this.loadUsuarios(); // Recargar la lista de usuarios
  }

}
