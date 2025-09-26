using GestionOT.Data;
using GestionOT.Data.Entities;
using GestionOT.Models;
using GestionOT.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GestionOT.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize] // Require a valid JWT for all actions
    public class UsuarioController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly PasswordService _passwordService;

        public UsuarioController(ApplicationDbContext context, PasswordService passwordService)
        {
            _context = context;
            _passwordService = passwordService;
        }

        // GET: /Usuario
        [HttpGet]
        [Authorize(Roles = "1")]
        public async Task<ActionResult<IEnumerable<UsuarioModel>>> GetUsuarios()
        {
            List<Usuario> usuarios = await _context.Usuarios
                .Include(u => u.FkIdRolNavigation)
                .ToListAsync();
                
            List<UsuarioModel> usuarioModels = usuarios.Select(u => new UsuarioModel
            {
                id = u.IdUsuario,
                correo = u.Correo,
                activo = u.Activo,
                rol = u.FkIdRolNavigation?.Nombre ?? "",
                rolId = u.FkIdRol
            }).ToList();
            
            return usuarioModels;
        }

        // GET: /Usuario/{id}
        [HttpGet("{id}")]
        [Authorize(Roles = "1")]
        public async Task<ActionResult<Usuario>> GetUsuario(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);

            if (usuario == null)
            {
                return NotFound();
            }

            return usuario;
        }

        // POST: /Usuario - SECURE: Password in request body
        [HttpPost]
        [Authorize(Roles = "1")]
        public async Task<ActionResult<Usuario>> CreateUsuario([FromBody] CreateUserRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.correo) || string.IsNullOrWhiteSpace(request.password))
                {
                    return BadRequest("Invalid request data. Email and password are required.");
                }

                // Validate password strength
                if (request.password.Length < 6)
                {
                    return BadRequest("Password must be at least 6 characters long.");
                }

                // VALIDATE ROLE EXISTS FIRST - This guarantees the role is not null
                Rol? existingRole = await _context.Rols.FirstOrDefaultAsync(r => r.IdRol == request.rolId);
                if (existingRole == null)
                {
                    return BadRequest($"Rol con ID {request.rolId} no existe.");
                }

                // Check if user already exists
                Usuario? existingUser = await _context.Usuarios
                    .FirstOrDefaultAsync(u => u.Correo.Equals(request.correo, StringComparison.OrdinalIgnoreCase));

                if (existingUser != null)
                {
                    return BadRequest("Usuario con este Correo ya existe.");
                }

                // Create new user using CreateUserRequest properties directly
                Usuario usr = new Usuario();
                usr.Correo = request.correo;
                usr.Password = _passwordService.HashPassword(request.password); // Hash the password
                usr.Activo = request.activo;
                usr.FkIdRol = request.rolId;

                _context.Usuarios.Add(usr);
                await _context.SaveChangesAsync();

                // Create UsuarioModel for response
                UsuarioModel responseModel = new UsuarioModel
                {
                    id = usr.IdUsuario,
                    correo = usr.Correo,
                    activo = usr.Activo,
                    rol = existingRole.Nombre,
                    rolId = usr.FkIdRol
                };

                return CreatedAtAction(nameof(GetUsuario), new { id = usr.IdUsuario }, responseModel);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        // PUT: /Usuario - Update user using UpdateUserRequest, find by email from request
        [HttpPut]
        [Authorize(Roles = "1")]
        public async Task<IActionResult> UpdateUsuario([FromBody] UpdateUserRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.correo))
                {
                    return BadRequest("Invalid request data. Email is required.");
                }

                // Find the user to update by email from request body
                Usuario? usuario = await BuscaUsuario(request.correo);
                if (usuario == null)
                {
                    return NotFound($"Usuario con correo '{request.correo}' no existe.");
                }

                // VALIDATE ROLE EXISTS
                Rol? existingRole = await _context.Rols.FirstOrDefaultAsync(r => r.IdRol == request.rolId);
                if (existingRole == null)
                {
                    return BadRequest($"Rol con ID {request.rolId} no existe.");
                }

                // Update user properties (email stays the same since we're finding by email)
                usuario.Activo = request.activo;
                usuario.FkIdRol = request.rolId;

                _context.Entry(usuario).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (await BuscaUsuario(request.correo) == null)
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT: /Usuario/cambiar-password/{id} - SECURE: Password in request body
        [HttpPut("cambiar-password/")]
        [Authorize(Roles = "1")]
        public async Task<IActionResult> CambiarPassword([FromBody] PasswordChangeRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.correo) || string.IsNullOrWhiteSpace(request.newPassword))
                {
                    return BadRequest("Invalid request data.");
                }

                // Validate new password
                if (request.newPassword.Length < 6)
                {
                    return BadRequest("Password must be at least 6 characters long.");
                }

                if (request.oldPassword == request.newPassword)
                {
                    return BadRequest("El passworddebe ser diferente.");
                }

                Usuario? usr = await BuscaUsuario(request.correo);

                if (usr is null)
                {
                    return NotFound("No existe Usuario");
                }
                bool isOldPasswordValid = _passwordService.VerifyPassword(request.oldPassword, usr.Password);

                if (!isOldPasswordValid)
                {
                    return BadRequest("Password actual es incorrecto.");
                }

                // Hash the new password
                usr.Password = _passwordService.HashPassword(request.newPassword);
                _context.Entry(usr).State = EntityState.Modified;


                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (await BuscaUsuario(request.correo) == null)
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }

            return NoContent();
        }

        // DELETE: /Usuario/{id}
        /*
        [HttpDelete("{id}")]
        [Authorize(Roles = "1")]
        public async Task<IActionResult> DeleteUsuario(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null)
            {
                return NotFound();
            }

            _context.Usuarios.Remove(usuario);
            await _context.SaveChangesAsync();

            return NoContent();
        }*/

        private async Task<Usuario?> BuscaUsuario(string correo)
        {
            return await _context.Usuarios.FirstOrDefaultAsync(u => u.Correo.Equals(correo, StringComparison.OrdinalIgnoreCase));
        }
    }
}