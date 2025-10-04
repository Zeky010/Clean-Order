using System;
using System.Collections.Generic;

namespace CleanOrderAPI.Data.Entities;

public partial class Documento
{
    public string IdDocumento { get; set; } = null!;

    public string TipoMime { get; set; } = null!;

    public byte[] Archivo { get; set; } = null!;

    public string FkRutCliente { get; set; } = null!;

    public string Activo { get; set; } = null!;

    public virtual Cliente FkRutClienteNavigation { get; set; } = null!;
}
