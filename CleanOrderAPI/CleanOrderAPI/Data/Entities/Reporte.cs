using System;
using System.Collections.Generic;

namespace GestionOT.Data.Entities;

public partial class Reporte
{
    public int IdReporte { get; set; }

    public string? Observacion { get; set; }

    public int FkUsuario { get; set; }

    public virtual Orden IdReporteNavigation { get; set; } = null!;

    public virtual ICollection<ImagenesReporte> ImagenesReportes { get; set; } = new List<ImagenesReporte>();
}
