export interface Cliente {
  Rut: string;
  DV: string;
  RazonSocial: string;
  Correo: string;
  Telefono?: string;
  Activo: string;
}

export interface Documento {
  IdDocumento: string;
  TipoMime: string;
  Archivo: string; //base64
  FkRutCliente: string;
  Activo: string;
}
