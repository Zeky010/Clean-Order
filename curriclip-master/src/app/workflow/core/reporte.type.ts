export interface Reporte {
  id?: number;
  correoUsuario: string;
  idOrden: number;
  observacion: string;
  tipoReporte: number;
  fecha: Date;
  imagenesReporte: ImagenesReporte[]
}

export interface ImagenesReporte{
  tipoMime: string;
  imagenes: File;
}