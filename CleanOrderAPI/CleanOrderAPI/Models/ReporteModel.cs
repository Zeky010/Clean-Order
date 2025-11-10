namespace CleanOrderAPI.Models
{    public class ReporteModel
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
}
