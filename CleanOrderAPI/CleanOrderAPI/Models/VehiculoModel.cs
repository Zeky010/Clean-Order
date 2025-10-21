using CleanOrderAPI.Controllers;
using System.Text.Json.Serialization;

namespace CleanOrderAPI.Models
{
    public class VehiculoModel
    {
        [JsonPropertyName("patente")]
        public string? Patente { get; set; }

        [JsonPropertyName("capacidad")]
        public int Capacidad { get; set; }

        [JsonPropertyName("activo")]
        public string? Activo { get; set; }

        [JsonPropertyName("tipoCarga")]
        public TipoCargaModel? TipoCarga { get; set; }
        
    }

    public sealed class VehiculoUpdateRequest
    {
        [JsonPropertyName("capacidad")]
        public int? Capacidad { get; set; }

        [JsonPropertyName("activo")]
        public string? Activo { get; set; }

        [JsonPropertyName("TipoCarga")]
        public TipoCargaUpdate? TipoCarga { get; set; }
    }

    public sealed class TipoCargaUpdate
    {
        [JsonPropertyName("id")]
        public int? Id { get; set; }
    }
}
