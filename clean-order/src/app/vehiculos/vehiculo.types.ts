export interface vehiculo {
    patente: string;
    capacidad: number;
    activo: string;
    TipoCarga: tipoCarga;
}


export interface tipoCarga {
    id: number;
    nombreCarga: string;
}

export type VehiculoUpdate = Partial<vehiculo>;