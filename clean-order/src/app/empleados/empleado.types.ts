export interface Empleado {
  rut: string;
  dv: string;
  nombre: string;
  apellido: string;
  direccion: string;
  telefono: string;
  activo: 'S' | 'N';
  idComuna: number;
  nombreComuna?: string;
  nombreRegion?: string;
}
