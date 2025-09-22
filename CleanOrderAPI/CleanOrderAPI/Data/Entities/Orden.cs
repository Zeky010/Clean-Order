using System;
using System.Collections.Generic;

namespace GestionOT.Data.Entities;

public partial class Orden
{
    public int IdOrden { get; set; }

    public int HorasTrabajo { get; set; }

    public DateTime FechaRegistro { get; set; }

    public DateTime FechaAgendada { get; set; }

    public string? Observacion { get; set; }

    public string Direccion { get; set; } = null!;

    public int Folio { get; set; }

    public int FkComuna { get; set; }

    public int FkRegion { get; set; }

    public string FkIdClientes { get; set; } = null!;

    public string FkPatente { get; set; } = null!;

    public int FkEstado { get; set; }

    public int? FkIdReporte { get; set; }

    public virtual Comuna FkComunaNavigation { get; set; } = null!;

    public virtual OrdenEstado FkEstadoNavigation { get; set; } = null!;

    public virtual Cliente FkIdClientesNavigation { get; set; } = null!;

    public virtual Vehiculo FkPatenteNavigation { get; set; } = null!;

    public virtual Reporte? Reporte { get; set; }
}
