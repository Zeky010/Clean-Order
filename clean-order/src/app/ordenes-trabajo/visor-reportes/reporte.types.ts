import { Usuario } from '../../usuarios/usuario.types';



export interface Reporte {
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
    imagen: File;
    idReporte: number;
}