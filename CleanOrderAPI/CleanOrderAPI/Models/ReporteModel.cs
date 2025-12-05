namespace CleanOrderAPI.Models
{
    public class ReporteModel
    {
        public required string CorreoUsuario { get; set; }
        public required int IdOrden { get; set; }
        public required string Observacion { get; set; }
        public required int TipoReporte { get; set; }
        public DateTime Fecha { get; set; }

        // Para recibir las imágenes desde FormData
        public List<IFormFile> Imagenes { get; set; } = new List<IFormFile>();
        public List<string> TipoMime { get; set; } = new List<string>();
    }
    public class ReporteResponseModel
    {
        public required string Mensaje { get; set; }
        public required int IdReporte { get; set; }
        public required int CantidadImagenes { get; set; }
    }

    public class ReporteTipoModel
    {
        public required int Codigo { get; set; }
        public required string Nombre { get; set; }
    }

    public class ImagenReporteModel
    {
        public required int IdImagen { get; set; }
        public required string TipoMime { get; set; }

        // For uploads via multipart/form-data (mirrors TS File)
        public required string imagenBase64 { get; set; }

        public required int IdReporte { get; set; }
    }

    // Generic to accommodate your concrete Usuario model when available
    public class ReporteDetalleModel
    {
        public required int IdReporte { get; set; }
        public required string Observacion { get; set; }
        public required UsuarioModel Usuario { get; set; }
        public required ReporteTipoModel TipoReporte { get; set; }
        public List<ImagenReporteModel> Imagenes { get; set; } = new();


    }
}
