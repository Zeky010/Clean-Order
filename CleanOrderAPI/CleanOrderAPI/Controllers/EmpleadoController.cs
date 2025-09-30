using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GestionOT.Data;
using GestionOT.Data.Entities;
using GestionOT.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CleanOrderAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class EmpleadoController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EmpleadoController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Empleado
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmpleadoModel>>> GetAll([FromQuery] bool? onlyActive = null)
        {
            IQueryable<Empleado> query = _context.Empleados.AsNoTracking();

            if (onlyActive.HasValue)
            {
                // Assuming Activo = "S" (Sí) / "N" (No)
                query = query.Where(e => (onlyActive.Value && e.Activo == "S") || (!onlyActive.Value && e.Activo != "S"));
            }

            var result = await query
                .Select(e => ToModel(e))
                .ToListAsync();

            return Ok(result);
        }

        // GET: api/Empleado/{rut}
        [HttpGet("{rut}")]
        public async Task<ActionResult<EmpleadoModel>> GetByRut(string rut)
        {
            if (string.IsNullOrWhiteSpace(rut))
                return BadRequest("Rut requerido.");

            var empleado = await _context.Empleados
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.RutEmpleado == rut);

            if (empleado == null)
                return NotFound();

            return Ok(ToModel(empleado));
        }

        // POST: api/Empleado
        [HttpPost]
        public async Task<ActionResult<EmpleadoModel>> Create([FromBody] EmpleadoModel model)
        {
            if (model == null)
                return BadRequest("Datos inválidos.");

            model.RutEmpleado = (model.RutEmpleado ?? "").Trim();
            model.Dv = (model.Dv ?? "").Trim().ToUpperInvariant();

            if (string.IsNullOrWhiteSpace(model.RutEmpleado) ||
                string.IsNullOrWhiteSpace(model.Dv) ||
                string.IsNullOrWhiteSpace(model.Nombre) ||
                string.IsNullOrWhiteSpace(model.Apellido))
            {
                return BadRequest("Rut, Dv, Nombre y Apellido son obligatorios.");
            }

            bool exists = await _context.Empleados.AnyAsync(e => e.RutEmpleado == model.RutEmpleado);
            if (exists)
                return Conflict($"Empleado con rut {model.RutEmpleado} ya existe.");

            Empleado entity = new Empleado
            {
                RutEmpleado = model.RutEmpleado,
                Dv = model.Dv,
                Nombre = model.Nombre,
                Apellido = model.Apellido,
                Direccion = model.Direccion,
                Telefono = model.Telefono,
                Activo = string.IsNullOrWhiteSpace(model.Activo) ? "S" : model.Activo,
                FkComuna = model.IdComuna
            };

            _context.Empleados.Add(entity);
            await _context.SaveChangesAsync();

            EmpleadoModel createdModel = ToModel(entity);
            return CreatedAtAction(nameof(GetByRut), new { rut = createdModel.RutEmpleado }, createdModel);
        }

        // PUT: api/Empleado/{rut}
        [HttpPut]
        public async Task<ActionResult<EmpleadoModel>> Update([FromBody] EmpleadoModel model)
        {
            if (string.IsNullOrWhiteSpace(model.RutEmpleado))
                return BadRequest("Rut requerido.");

            if (model == null)
                return BadRequest("Datos inválidos.");

            Empleado? entity = await _context.Empleados.FirstOrDefaultAsync(e => e.RutEmpleado == model.RutEmpleado);
            if (entity == null)
                return NotFound();

            // Update allowed fields
            entity.Dv = model.Dv?.Trim().ToUpperInvariant() ?? entity.Dv;
            entity.Nombre = model.Nombre ?? entity.Nombre;
            entity.Apellido = model.Apellido ?? entity.Apellido;
            entity.Direccion = model.Direccion;
            entity.Telefono = model.Telefono;
            if (!string.IsNullOrWhiteSpace(model.Activo))
                entity.Activo = model.Activo;
            entity.FkComuna = model.IdComuna;

            await _context.SaveChangesAsync();

            return Ok(ToModel(entity));
        }

        // DELETE: api/Empleado/{rut}
        [HttpDelete("{rut}")]
        public async Task<IActionResult> Delete(string rut)
        {
            if (string.IsNullOrWhiteSpace(rut))
                return BadRequest("Rut requerido.");

            var entity = await _context.Empleados.FirstOrDefaultAsync(e => e.RutEmpleado == rut);
            if (entity == null)
                return NotFound();

            _context.Empleados.Remove(entity);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private static EmpleadoModel ToModel(Empleado e) => new()
        {
            RutEmpleado = e.RutEmpleado,
            Dv = e.Dv,
            Nombre = e.Nombre,
            Apellido = e.Apellido,
            Direccion = e.Direccion,
            Telefono = e.Telefono,
            Activo = e.Activo,
            IdComuna = e.FkComuna
        };
    }
}
