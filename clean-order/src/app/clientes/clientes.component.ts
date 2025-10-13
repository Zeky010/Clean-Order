import { Component, OnInit, inject } from '@angular/core';
import { Cliente } from './clientes.types';
import { ClientesService } from './clientes.service';
import { ClienteFormComponent } from './cliente-form/cliente-form.component';
import { ClienteDetalleComponent } from './cliente-detalle/cliente-detalle.component';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css', '../shared/entity-table.css'],
  imports: [ClienteFormComponent, ClienteDetalleComponent],
})
export class ClientesComponent implements OnInit {
  private clientesService = inject(ClientesService);  
  public clientes: Cliente[] = [];
  public selectedCliente: Cliente | null = null;
  loading = true;
  error: string | null = null;

  showCreateForm = false;
  showEditForm = false;
  isEditMode = false;
  showClienteDetalle = false;

  // Filtro por nombre/razón social
  filterText = '';

  // Lista filtrada (insensible a mayúsculas/minúsculas)
  get filteredClientes(): Cliente[] {
    const q = this.filterText.trim().toLowerCase();
    if (!q) return this.clientes;
    return this.clientes.filter(c =>
      (c.razonSocial ?? '').toLowerCase().includes(q)
    );
  }

  ngOnInit(): void {
    this.loadClientes();
  }

  loadClientes(): void {
    this.loading = true;
    this.clientesService.getClientes().subscribe({
      next: (clientes) => {
        this.clientes = clientes;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading clientes:', error);
        this.error = 'No se pudieron cargar los clientes';
        this.loading = false;
      }
    });
  }

  crearCliente() {
    this.closeForms();
    this.isEditMode = false;
    this.selectedCliente = null;
    this.showCreateForm = true;
  }

  editarCliente(cliente: Cliente) {
    this.closeForms();
    this.selectedCliente = cliente;
    this.isEditMode = true;
    this.showEditForm = true;
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
    this.clientesService.updateCliente(cliente.rut,cliente).subscribe({
      next: () => {
        this.closeForms();
        this.loadClientes();
      },
      error: (err) =>{
        this.handleMutationError(err, 'actualizar');
      } 
    });
  }

  onCancelForm() {
    this.closeForms();
  }

  closeForms() {
    this.showCreateForm = false;
    this.showEditForm = false;
    this.isEditMode = false;
    this.showClienteDetalle = false;
    this.selectedCliente = null;
  }

  // Método específico para cerrar solo el detalle
  // closeDetalle() {
  //   this.showClienteDetalle = false;
  //   this.selectedCliente = null;
  // }

  verDetalles(cliente: Cliente) {
    //this.closeForms();
    this.selectedCliente = cliente;
    this.showClienteDetalle = true; // Mostrar detalle
  }

  onFilter(event: Event) {
    this.filterText = (event.target as HTMLInputElement).value;
  }

  clearFilter() {
    this.filterText = '';
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
