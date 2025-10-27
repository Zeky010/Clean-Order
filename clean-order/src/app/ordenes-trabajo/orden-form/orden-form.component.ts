import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  inject,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OrdenTrabajo } from '../ordenes-trabajo.types';
import { OrdenForm, empleadoAsignar } from './orden-form.type';
import { OrdenesTrabajoService } from '../ordenes-trabajo.service';
import { ComunaRegionSelectorComponent } from '../../comuna-region/comuna-region-selector.component';
import { ListaAsignacionEmpleadoComponent } from './lista-asignacion-empleado/lista-asignacion-empleado.component';
import { ListaAsignacionVehiculoComponent } from './lista-asignacion-vehiculo/lista-asignacion-vehiculo.component';
import { ClientesService } from '../../clientes/clientes.service';
import { Cliente } from '../../clientes/clientes.types';
import { vehiculo } from '../../vehiculos/vehiculo.types';

@Component({
  selector: 'app-orden-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ComunaRegionSelectorComponent,
    ListaAsignacionEmpleadoComponent,
    ListaAsignacionVehiculoComponent,
  ],
  templateUrl: './orden-form.component.html',
  styleUrls: [
    './orden-form.component.css',
    '../../shared/styles/forms.css',
    '../../shared/styles/buttons.css',
  ],
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
  selectedVehiculo: vehiculo | null = null;
  clientesActivos: Cliente[] = [];
  empleadosSeleccionadosTouched = false;
  empleadosSeleccionadosError = false;
  
  vehiculoSeleccionadoTouched = false;
  vehiculoSeleccionadoError = false;

  // Etiquetas de formulario
  readonly fieldLabels: Record<string, string> = {
    folio: 'Folio',
    horasTrabajo: 'Horas de Trabajo',
    fechaAgendada: 'Fecha Agendada',
    direccion: 'Dirección',
    idComuna: 'Comuna y Región',
    rutCliente: 'Cliente',
    observaciones: 'Observaciones',
    idEstado: 'Estado',
  };

  // Mensajes personalizados por campo y por validador
  // Edite aquí para cambiar los textos.
  readonly customMessages: Record<string, Record<string, string>> = {
    folio: {
      required: 'El Folio es obligatorio.',
      pattern: 'El Folio debe ser un número entero positivo.',
      min: 'El Folio debe ser mayor o igual a 1.',
      folioDuplicado: 'El Folio ya existe.',
    },
    horasTrabajo: {
      required: 'Las horas de trabajo son obligatorias.',
      pattern: 'Horas de trabajo debe ser un entero positivo.',
      min: 'Horas de trabajo debe ser ≥ 1.',
    },
    fechaAgendada: {
      required: 'Debe seleccionar una fecha y hora.',
    },
    direccion: {
      required: 'La dirección es obligatoria.',
      maxlength: 'La dirección supera la longitud máxima permitida.',
    },
    idComuna: {
      required: 'Debe seleccionar una comuna.',
    },
    rutCliente: {
      required: 'Debe seleccionar un cliente.',
    },
    observaciones: {
      maxlength: 'Las observaciones superan la longitud máxima permitida.',
    },
  };

  constructor() {
    this.ordenForm = this.fb.group({
      folio: [
        null,
        [
          Validators.required,
          Validators.min(1),
          Validators.pattern(/^[1-9]\d*$/),
        ],
      ], // ahora numérico entero positivo
      horasTrabajo: [
        1,
        [
          Validators.required,
          Validators.min(1),
          Validators.pattern(/^[1-9]\d*$/),
        ],
      ],
      fechaAgendada: ['', Validators.required],
      observaciones: ['', Validators.maxLength(500)],
      direccion: ['', [Validators.required, Validators.maxLength(200)]],
      idComuna: [{ value: null, disabled: this.loading }, Validators.required],
      rutCliente: [null, Validators.required],
      idEstado: [1, Validators.required], // Forzar estado "1" (Agendado) por defecto al crear ordenes
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
      next: (c) => (this.clientesActivos = c),
      error: (e) => console.error('Error cargando clientes activos', e),
    });
  }

  private populateForm(orden: OrdenTrabajo): void {
    // Formatear la fecha para el input datetime-local
    const fechaAgendada = orden.fechaAgendada
      ? new Date(orden.fechaAgendada).toISOString().slice(0, 16)
      : '';

    this.ordenForm.patchValue({
      folio: orden.folio,
      horasTrabajo: orden.horasTrabajo,
      fechaAgendada: fechaAgendada,
      observaciones: orden.observaciones || '',
      direccion: orden.direccion,
      idComuna: orden.comuna.id,
      rutCliente: orden.idCliente,
      idEstado: 1, // Forzar "Agendado" siempre al hacer patchValue
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
    if (
      !value ||
      isNaN(num) ||
      num <= 0 ||
      ctrl.hasError('required') ||
      ctrl.hasError('min') ||
      ctrl.hasError('pattern')
    ) {
      // Quitar error de duplicado si quedó seteado previamente
      if (ctrl.errors && ctrl.errors['folioDuplicado']) {
        const { ...others } = ctrl.errors;
        ctrl.setErrors(Object.keys(others).length ? others : null);
      }
      return;
    }

    this.ordenesService.folioExiste(num).subscribe((resp) => {
      const duplicado = resp !== -1;
      if (duplicado) {
        const errs = ctrl.errors || {};
        errs['folioDuplicado'] = true;
        ctrl.setErrors(errs);
      } else if (ctrl.errors) {
        const { ...others } = ctrl.errors;
        ctrl.setErrors(Object.keys(others).length ? others : null);
      }
    });
  }

  onSubmit(): void {
    this.empleadosSeleccionadosTouched = true;
    // Validación de vehículo: requerido siempre
    this.vehiculoSeleccionadoTouched = true;
    if (!this.selectedVehiculo) {
      this.vehiculoSeleccionadoError = true;
      return;
    } else {
      this.vehiculoSeleccionadoError = false;
    }

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
        empleadoAsignar: this.selectedEmpleados,
        vehiculoAsignado: this.selectedVehiculo!.patente,
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
    this.selectedVehiculo = null;
    this.empleadosSeleccionadosError = false;
    this.empleadosSeleccionadosTouched = false;
    // Limpiar flags de vehículo
    this.vehiculoSeleccionadoError = false;
    this.vehiculoSeleccionadoTouched = false;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.ordenForm.controls).forEach((key) => {
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

  // Manejar cambio de vehículo para limpiar errores cuando corresponda
  onVehiculoSeleccionadoChange(v: vehiculo | null): void {
    this.selectedVehiculo = v;
    if (v) {
      this.vehiculoSeleccionadoError = false;
    }
  }

  // Getters para facilitar el acceso a los controles en el template
  get folio() {
    return this.ordenForm.get('folio');
  }
  get horasTrabajo() {
    return this.ordenForm.get('horasTrabajo');
  }
  get fechaAgendada() {
    return this.ordenForm.get('fechaAgendada');
  }
  get observaciones() {
    return this.ordenForm.get('observaciones');
  }
  get direccion() {
    return this.ordenForm.get('direccion');
  }
  get idComuna() {
    return this.ordenForm.get('idComuna');
  }
  get rutCliente() {
    return this.ordenForm.get('rutCliente');
  }
  get idEstado() {
    return this.ordenForm.get('idEstado');
  }

  // Método helper para obtener errores
  getErrorMessage(controlName: string): string {
    const control = this.ordenForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    const label = this.fieldLabels[controlName] ?? controlName;
    const msgs = this.customMessages[controlName] ?? {};

    if (control.errors['required']) {
      return msgs['required'] ?? `${label} es requerido`;
    }
    if (control.errors['min']) {
      const min = control.errors['min']?.min ?? 1;
      return msgs['min'] ?? `${label} debe ser ≥ ${min}`;
    }
    if (control.errors['pattern']) {
      return msgs['pattern'] ?? `${label} tiene un formato inválido`;
    }
    if (control.errors['maxlength']) {
      const max = control.errors['maxlength']?.requiredLength;
      return (
        msgs['maxlength'] ??
        `${label} excede la longitud máxima${max ? ` (${max})` : ''}`
      );
    }
    if (control.errors['folioDuplicado']) {
      return msgs['folioDuplicado'] ?? 'El Folio ya existe';
    }
    return '';
  }

  // Mensaje de error específico para la selección de empleados (para usar en el template)
  getEmpleadosSeleccionadosErrorMessage(): string {
    if (
      this.empleadosSeleccionadosTouched &&
      this.empleadosSeleccionadosError
    ) {
      return 'Debe seleccionar al menos un empleado';
    }
    return '';
  }

  // Mensaje de error específico para la selección de vehículo
  getVehiculoSeleccionadoErrorMessage(): string {
    if (this.vehiculoSeleccionadoTouched && this.vehiculoSeleccionadoError) {
      return 'Debe seleccionar un vehículo';
    }
    return '';
  }
}
