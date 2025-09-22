using System;
using System.Collections.Generic;

namespace GestionOT.Data.Entities;

public partial class Empleado
{
    public string RutEmpleado { get; set; } = null!;

    public string Dv { get; set; } = null!;

    public string Nombre { get; set; } = null!;

    public string Apellido { get; set; } = null!;

    public string? Direccion { get; set; }

    public string? Telefono { get; set; }

    public string Activo { get; set; } = null!;

    public int? FkComuna { get; set; }

    public int? FkIdUsuario { get; set; }

    public virtual Comuna? FkComunaNavigation { get; set; }

    public virtual Usuario? FkIdUsuarioNavigation { get; set; }
}
