import { Component, Inject, OnInit } from '@angular/core';
import { Cliente } from './clientes.types';
import { ClientesService } from './clientes.service';
import { ClienteFormComponent } from './cliente-form/cliente-form.component';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css', '../shared/entity-table.css'],
  imports: [ClienteFormComponent] 
})
export class ClientesComponent implements OnInit {
  private clientesService: ClientesService = Inject(ClientesService);
  public clientes: Cliente[] = [];
  showCreateForm = false;
  showEditForm = false;
  public selectedCliente: Cliente | null = null;
  public loading = true;
  public error: string | null = null;
  isEditMode = false;



  ngOnInit(): void {
    this.loadClientes();
  }

  loadClientes(): void {
    // Implementar llamada al servicio
    this.clientesService.getClientes().subscribe({
      next: (clientes) => {
        this.clientes = clientes;
      },
      error: (error) => {
        console.error('Error loading clientes:', error);
      }
    });
  }

  onCreateSubmit(cliente: Cliente): void {

    this.clientesService.createCliente(cliente).subscribe({
      next: () => {
        this.closeForms();
        this.loadClientes();
      },
      error: (err) => this.handleMutationError(err, 'crear')
    });
  }

  onEditSubmit(cliente: Cliente): void {
    if (!this.selectedCliente) return;    
    this.clientesService.updateCliente(cliente.Rut,cliente).subscribe({
      next: () => {
        this.closeForms();
        this.loadClientes();
      },
      error: (err) =>{
        this.handleMutationError(err, 'actualizar');
      } 
    });
  }

  crearCliente() {
    this.selectedCliente = null;
    this.isEditMode = false;

  }

  editarCliente(cliente: Cliente) {
    this.selectedCliente = cliente;
    this.isEditMode = true;
  }



  closeForms() {
    this.selectedCliente = null;
    this.isEditMode = false;
    this.showCreateForm = false;
    this.showEditForm = false;
  }

  onCancelForm() {
    this.closeForms();
  }


    private handleMutationError(err: unknown, accion: string) {
    const status = (err as { status?: number })?.status;
    switch (status) {
      case 0:
        alert('No se pudo conectar al servidor');
        break;
      case 400:
        alert(`Datos inválidos al ${accion} cliente.`);
        break;
      case 404:
        alert('Cliente no encontrado.');
        break;
      case 409:
        alert('Este rut ya está registrado.');
        break;
      case 500:
        alert('Error interno del servidor.');
        break;
      default:
        alert(`Error al ${accion} cliente .`);
    }
    console.error('Error mutación cliente:', err);
  }
}
