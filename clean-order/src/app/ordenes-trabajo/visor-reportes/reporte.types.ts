import { Usuario } from '../../usuarios/usuario.types';



export interface ReporteDetalle {
    idReporte: number;
    observacion: string;
    usuario: Usuario;
    tipoReporte: ReporteTipo;
    imagenes: imagenReporte[];
}

export interface ReporteTipo {  
    codigo: number;
    nombre: string;
}

export interface imagenReporte {
    idImagen: number;
    tipoMime: string;
    imagenBase64: string;
    idReporte: number;
}