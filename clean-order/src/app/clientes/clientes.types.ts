export interface Cliente {
  rut: string;
  dv: string;
  razonSocial: string;
  correo: string;
  telefono?: string;
  activo: string;
}

export interface Documento {
  idDocumento: string;
  tipoMime: string;
  archivo: string; //base64
  fkRutCliente: string;
  activo: string;
}
