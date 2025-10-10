import { Comuna, Region } from "../comuna-region/comuna-region.types";

export interface OrdenTrabajo {
  id: number;
  horasTrabajo: number;
  fechaRegistro: Date;
  fechaAgendada: Date;
  fechaFinalizado: Date;
  observaciones: string;
  direccion: string;
  folio: number;
  comuna: Comuna;
  region: Region;
  idCliente: number;
  cliente: string; // Nombre del cliente
  idEstado: number;
  estado: string; // Descripción del estado
}

export interface OrdenEmpleado {
  idOrdenTrabajo: number;
  idEmpleado: number;
  rutEmpleado: string;
  empleado: string;  
}