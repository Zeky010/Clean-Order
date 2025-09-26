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
    public class PasswordChangeRequest
    {
        public required string correo { get; set; }
        public required string oldPassword { get; set; }
        public required string newPassword { get; set; }
    }

    public class CreateUserRequest
    {
        public string correo { get; set; } = null!;
        public int activo { get; set; }
        public int rolId { get; set; }
        public required string password { get; set; }
    }

    public class UpdateUserRequest
    {
        public string correo { get; set; } = null!;
        public int activo { get; set; }
        public int rolId { get; set; }
    }

}
