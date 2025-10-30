using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CleanOrderAPI.Data.Entities;

[Table("reporte_tipo")]
public partial class ReporteTipo
{
    [Key]
    [Column(TypeName = "int(11)")]
    public int CODIGO { get; set; }

    [StringLength(30)]
    public string NOMBRE { get; set; } = null!;

    [InverseProperty("FK_TIPONavigation")]
    public virtual ICollection<Reporte> REPORTES { get; set; } = new List<Reporte>();
}
