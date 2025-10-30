using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CleanOrderAPI.Data.Entities;

public partial class Reporte
{
    [Key]
    [Column(TypeName = "int(11)")]
    public int IdReporte { get; set; }

    [StringLength(100)]
    public string? Observacion { get; set; }

    [Column(TypeName = "int(11)")]
    public int FkUsuario { get; set; }

    [Column(TypeName = "int(11)")]
    public int FkIdOrden { get; set; }

    [Column(TypeName = "int(11)")]
    public int FK_TIPO { get; set; }

    public virtual Orden FkIdOrdenNavigation { get; set; } = null!;
    public virtual ReporteTipo FK_TIPONavigation { get; set; } = null!;
    public virtual ICollection<ImagenesReporte> ImagenesReportes { get; set; } = new List<ImagenesReporte>();
}
