using GestionOT.Data;
using GestionOT.Data.Entities;
using GestionOT.Models;
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

        public UsuarioController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: /Usuario
        [HttpGet]
        [Authorize(Roles = "1")]
        public async Task<ActionResult<IEnumerable<Usuario>>> GetUsuarios()
        {           
            return await _context.Usuarios.Where(u => u.Activo == 1).ToListAsync();
        }

        // GET: /Usuario/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Usuario>> GetUsuario(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);

            if (usuario == null)
            {
                return NotFound();
            }

            return usuario;
        }

        // POST: /Usuario
        // Only role id "1" (e.g., Admin) can create users
        [HttpPost]
        [Authorize(Roles = "1")]
        public async Task<ActionResult<Usuario>> CreateUsuario(Usuario usuario)
        {
            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUsuario), new { id = usuario.IdUsuario }, usuario);
        }

        // PUT: /Usuario/cambiar-password/{id}
        // Only role id "1" can change passwords (adjust as needed)
        [HttpPut("cambiar-password/{id}")]
        [Authorize(Roles = "1")]
        public async Task<IActionResult> CambiarPassword(int id, string password, UsuarioModel usuario)
        {
            if (usuario.AreFieldsValid() == false)
            {
                return BadRequest("Invalid data.");
            }

            Usuario? usr = BuscaUsuario(usuario.id);

            if (usr is null)
            {
                return NotFound("No existe Usuario");
            }

            // WARNING: plain-text password assignment; replace with hashing in production
            usr.Password = password;
            _context.Entry(usr).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (BuscaUsuario(id) == null)
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: /Usuario/{id}
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
        }

        private Usuario? BuscaUsuario(int id)
        {
            return _context.Usuarios.FirstOrDefault(u => u.IdUsuario == id);
        }
    }
}