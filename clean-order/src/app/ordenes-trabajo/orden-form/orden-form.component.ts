import { Component, OnInit, Input, Output, EventEmitter, inject, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OrdenTrabajo } from '../ordenes-trabajo.types';
import { OrdenForm, empleadoAsignar } from './orden-form.type';
import { OrdenesTrabajoService } from '../ordenes-trabajo.service';
import { ComunaRegionSelectorComponent } from '../../comuna-region/comuna-region-selector.component';
import { ListaAsignacionEmpleadoComponent } from './lista-asignacion-empleado/lista-asignacion-empleado.component';
import { ClientesService } from '../../clientes/clientes.service';
import { Cliente } from '../../clientes/clientes.types';

@Component({
  selector: 'app-orden-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ComunaRegionSelectorComponent, ListaAsignacionEmpleadoComponent],
  templateUrl: './orden-form.component.html',
  styleUrls: ['./orden-form.component.css', '../../shared/forms.css']
})
export class OrdenFormComponent implements OnInit, OnChanges {
  @Input() orden: OrdenTrabajo | null = null;
  @Input() isEditMode = false; // no se usara, solose 
  @Output() submitForm = new EventEmitter<OrdenForm>();
  @Output() cancelForm = new EventEmitter<void>();

  ordenForm: FormGroup;
  loading = false;
  error: string | null = null;

  private fb = inject(FormBuilder);
  private ordenesService = inject(OrdenesTrabajoService);
  private clientesService = inject(ClientesService);
  selectedEmpleados: empleadoAsignar[] = [];
  clientesActivos: Cliente[] = [];
  empleadosSeleccionadosTouched = false;
  empleadosSeleccionadosError = false;

  constructor() {
    this.ordenForm = this.fb.group({
      folio: [null, [Validators.required, Validators.min(1), Validators.pattern(/^[1-9]\d*$/)]], // ahora numérico entero positivo
      horasTrabajo: [1, [Validators.required, Validators.min(1), Validators.pattern(/^[1-9]\d*$/)]],
      fechaAgendada: ['', Validators.required],
      observaciones: ['', Validators.maxLength(500)],
      direccion: ['', [Validators.required, Validators.maxLength(200)]],
      idComuna: [{ value: null, disabled: this.loading }, Validators.required],
      rutCliente: [null, Validators.required],
      idEstado: [1, Validators.required] // Forzar estado "1" (Agendado) por defecto al crear ordenes
    });
  }

  ngOnInit(): void {
    this.loadClientesActivos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['orden'] && this.orden && this.isEditMode) {
      this.populateForm(this.orden);
    }
  }

  private loadClientesActivos(): void {
    this.clientesService.getClientesActivos().subscribe({
      next: c => this.clientesActivos = c,
      error: e => console.error('Error cargando clientes activos', e)
    });
  }

  private populateForm(orden: OrdenTrabajo): void {
    // Formatear la fecha para el input datetime-local
    const fechaAgendada = orden.fechaAgendada ? 
      new Date(orden.fechaAgendada).toISOString().slice(0, 16) : '';

    this.ordenForm.patchValue({
      folio: orden.folio,
      horasTrabajo: orden.horasTrabajo,
      fechaAgendada: fechaAgendada,
      observaciones: orden.observaciones || '',
      direccion: orden.direccion,
      idComuna: orden.comuna.id,
      rutCliente: orden.idCliente,
      idEstado: 1 // Forzar "Agendado" siempre al hacer patchValue
    });
    // Si al editar se quiere precargar empleados, se podría asignar aquí (si vienen en la orden).
  }

  // Validación adicional al perder el foco del input de folio
  onFolioBlur(): void {
    const ctrl = this.folio;
    if (!ctrl) return;

    ctrl.markAsTouched();

    if (this.isEditMode) return;

    const value = ctrl.value;
    const num = Number(value);

    // Si hay errores de validación síncronos o el valor no es válido, no consultar backend.
    if (!value || isNaN(num) || num <= 0 || ctrl.hasError('required') || ctrl.hasError('min') || ctrl.hasError('pattern')) {
      // Quitar error de duplicado si quedó seteado previamente
      if (ctrl.errors && ctrl.errors['folioDuplicado']) {
        const { ...others } = ctrl.errors;
        ctrl.setErrors(Object.keys(others).length ? others : null);
      }
      return;
    }

    this.ordenesService.folioExiste(num).subscribe(resp => {
      const duplicado = resp !== -1;
      if (duplicado) {
        const errs = ctrl.errors || {};
        errs['folioDuplicado'] = true;
        ctrl.setErrors(errs);
      } else if (ctrl.errors) {
        const {...others } = ctrl.errors;
        ctrl.setErrors(Object.keys(others).length ? others : null);
      }
    });
  }

  onSubmit(): void {
    this.empleadosSeleccionadosTouched = true;
    // Validar que exista al menos un empleado seleccionado solo al crear
    if (!this.isEditMode && this.selectedEmpleados.length === 0) {
      this.empleadosSeleccionadosError = true;
      return;
    } else {
      this.empleadosSeleccionadosError = false;
    }
    if (this.ordenForm.valid) {
      const formValue = this.ordenForm.value;
      const ordenData: OrdenForm = {
        ...formValue,
        folio: Number(formValue.folio), // asegurar numérico
        fechaRegistro: new Date(),
        fechaAgendada: new Date(formValue.fechaAgendada),
        empleadoAsignar: this.selectedEmpleados
      };
      this.submitForm.emit(ordenData);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.cancelForm.emit();
  }

  onReset(): void {
    this.ordenForm.reset();
    this.ordenForm.patchValue({ idEstado: 1 }); // Forzar "Agendado" siempre al hacer patchValue
    this.selectedEmpleados = [];
    this.empleadosSeleccionadosError = false;
    this.empleadosSeleccionadosTouched = false;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.ordenForm.controls).forEach(key => {
      const control = this.ordenForm.get(key);
      control?.markAsTouched();
    });
  }

  onEmpleadosSeleccionados(lista: empleadoAsignar[]): void {
    this.selectedEmpleados = lista;
    // Limpiar error si ahora hay alguno seleccionado
    if (this.selectedEmpleados.length > 0) {
      this.empleadosSeleccionadosError = false;
    }
  }

  // Getters para facilitar el acceso a los controles en el template
  get folio() { return this.ordenForm.get('folio'); }
  get horasTrabajo() { return this.ordenForm.get('horasTrabajo'); }
  get fechaAgendada() { return this.ordenForm.get('fechaAgendada'); }
  get observaciones() { return this.ordenForm.get('observaciones'); }
  get direccion() { return this.ordenForm.get('direccion'); }
  get idComuna() { return this.ordenForm.get('idComuna'); }
  get rutCliente() { return this.ordenForm.get('rutCliente'); }
  get idEstado() { return this.ordenForm.get('idEstado'); }

  // Método helper para obtener errores
  getErrorMessage(controlName: string): string {
    const control = this.ordenForm.get(controlName);
    if (control?.errors && control?.touched) {
      if (control.errors['required']) return `${controlName} es requerido`;
      if (controlName === 'horasTrabajo' || controlName === 'folio') {
        if (control.errors['min']) return `${controlName} debe ser >= 1`;
        if (control.errors['pattern']) return `${controlName} debe ser un número entero positivo`;
      }
      if (controlName === 'folio' && control.errors['folioDuplicado']) return 'folio ya existe';
      if (control.errors['maxlength']) return `${controlName} excede la longitud máxima`;
    }
    return '';
  }

  // Mensaje de error específico para la selección de empleados (para usar en el template)
  getEmpleadosSeleccionadosErrorMessage(): string {
    if (this.empleadosSeleccionadosTouched && this.empleadosSeleccionadosError) {
      return 'Debe seleccionar al menos un empleado';
    }
    return '';
  }
}