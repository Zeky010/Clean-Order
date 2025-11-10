export interface Client { id: number; name: string; }
export type OrderStatus = 'AGENDADO' | 'EN PROCESO' | 'REALIZADO' | 'SUSPENDIDO';

export type ISODateString = string;

export interface ComunaModel {
  id: number;
  nombre: string;
  regionId: number;
}

export interface RegionModel {
  id: number;
  nombre: string;
}

export interface Orden {
  id: number;
  horasTrabajo: number;
  fechaRegistro: ISODateString;
  fechaAgendada: ISODateString;
  fechaFinalizado: ISODateString;
  observaciones: string;
  direccion: string;
  folio: string;
  comuna: ComunaModel;
  region: RegionModel;
  idCliente: number;
  cliente: string;        // nombre del cliente
  idEstado: number;
  estado: string;         // descripción del estado
  patenteVehiculo: string;
}