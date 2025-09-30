export interface Region {
    id: number;
    nombre: string;
}

export interface Comuna {
    id: number;
    nombre: string;
    idRegion: number;
}