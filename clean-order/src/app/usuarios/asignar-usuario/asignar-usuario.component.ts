import { Component, inject, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UsuarioService } from '../usuarios.service';
import { EmpleadoService } from '../../empleados/empleado.service';
import { Usuario } from '../usuario.types';
import { Empleado } from '../../empleados/empleado.types';  
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-asignar-usuario',
  imports: [CommonModule],
  templateUrl: './asignar-usuario.component.html',
  styleUrls: ['./asignar-usuario.component.css', 
              '../../shared/styles/entity-table.css', 
              '../../shared/styles/buttons.css'
  ],
})
export class AsignarUsuarioComponent implements OnInit {
  @Input({ required: true }) usuario!: Usuario;
  @Output() assignComplete = new EventEmitter<void>();
  @Output() assignCancel = new EventEmitter<void>();

  private usuarioService = inject(UsuarioService);
  private empleadoService = inject(EmpleadoService);

  public empleados: Empleado[] = [];

  ngOnInit(): void {
    this.loadEmpleados();
  }

  loadEmpleados(): void {
    this.empleadoService.getActiveEmpleados().subscribe(empleados => {
      // Filtrar empleados que no tengan usuario asignado
      this.empleados = empleados;
    });
  }

  asignarUsuario(rutEmpleado: string): void {
    console.log('Asignando usuario al empleado con RUT:', rutEmpleado);
    
    // Actualizar el usuario con el RUT del empleado
    const usuarioActualizado: Usuario = {
      ...this.usuario,
      rutEmpleado: rutEmpleado
    };

    this.usuarioService.asignarEmpleadoAUsuario(rutEmpleado, usuarioActualizado).subscribe({
      next: (response) => {
        console.log('Usuario asignado exitosamente', response);
        this.assignComplete.emit();
      },
      error: (error) => {
        console.error('Error al asignar usuario:', error);
      }
    });
  }

  cancelar(): void {
    this.assignCancel.emit();
  }
}
