export interface Empleado {
  rut: number;
  dv: string;
  nombre: string;
  apellido: string;
  direccion: string;
  telefono: string;
  activo: 'S' | 'N';
  idComuna: number;
}
