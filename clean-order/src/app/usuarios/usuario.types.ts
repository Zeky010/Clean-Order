export interface Usuario {
    id: number;
    correo: string;
    rol: string;
    rolId: number;
    activo: boolean;
    rutEmpleado: string;
}

export interface PasswordChange {  
    email: string;
    oldPassword: string;
    newPassword: string;
}

export interface UsuarioCreation {
    correo: string;
    rolId: number;
    password: string;
    activo: number;
}

export interface UsuarioUpdate {
    correo: string;
    rolId: number;
    activo: number;
}
