export interface OrdenForm {
  rutCliente: number;
  horasTrabajo: number;
  fechaRegistro: Date;
  fechaAgendada: Date;
  observaciones: string;
  direccion: string;
  folio: number; // cambiado de string a number
  idComuna: number;
  idEstado: number;
  empleadoAsignar?: empleadoAsignar[]; // Lista de empleados seleccionados
}

export interface empleadoAsignar {
  rut: string;
  dv: string;
  nombre: string;
}

export interface ordenEstado {
  id: number;
  nombre: string;
}