export interface Documento {
  idDocumento: number;
  nombre: string;
  fechaSubida: Date;
  tipoMime: string;
  archivo: string; //base64
  tamanoBytes: number;
  rutCliente: string;
}

export interface DocumentoSinArchivo {
  idDocumento: number;
  nombre: string;
  fechaSubida: Date;
  tipoMime: string;
  tamanoBytes: number;
  rutCliente: string;
}
