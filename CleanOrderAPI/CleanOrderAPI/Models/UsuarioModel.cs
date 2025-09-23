namespace GestionOT.Models
{
    public class UsuarioModel
    {
        public int id { get; set; }
        public string correo { get; set; } = null!;
        public int activo { get; set; }
        public string rol { get; set; }
        public int rolId { get; set; }


        public bool AreFieldsValid()
        {
            return !string.IsNullOrEmpty(correo) && activo >= 0 && rolId >= 0;
        }
    }
}
