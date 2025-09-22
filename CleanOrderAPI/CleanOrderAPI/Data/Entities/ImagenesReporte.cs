using System;
using System.Collections.Generic;

namespace GestionOT.Data.Entities;

public partial class ImagenesReporte
{
    public int IdImgReporte { get; set; }

    public string TipoMime { get; set; } = null!;

    public byte[] Archivo { get; set; } = null!;

    public int FkIdReporte { get; set; }

    public virtual Reporte FkIdReporteNavigation { get; set; } = null!;
}
