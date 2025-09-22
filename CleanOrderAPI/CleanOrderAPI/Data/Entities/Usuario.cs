using System;
using System.Collections.Generic;

namespace GestionOT.Data.Entities;

public partial class Usuario
{
    public int IdUsuario { get; set; }

    public string Correo { get; set; } = null!;

    public string Password { get; set; } = null!;

    public int Activo { get; set; }

    public int FkIdRol { get; set; }

    public virtual ICollection<Empleado> Empleados { get; set; } = new List<Empleado>();

    public virtual Rol FkIdRolNavigation { get; set; } = null!;
}
