using System;
using System.Collections.Generic;

namespace GestionOT.Data.Entities;

public partial class Documento
{
    public string IdDocumento { get; set; } = null!;

    public string TipoMime { get; set; } = null!;

    public byte[] Archivo { get; set; } = null!;

    public string FkIdCliente { get; set; } = null!;

    public string Activo { get; set; } = null!;

    public virtual Cliente FkIdClienteNavigation { get; set; } = null!;
}
