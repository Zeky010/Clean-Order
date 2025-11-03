using CleanOrderAPI.Data;
using CleanOrderAPI.Data.Entities;
using CleanOrderAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

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

        // Re-usable server-translatable projection (safe in LINQ to EF)
        private static readonly Expression<Func<Empleado, EmpleadoModel>> EmpleadoProjection =
            e => new EmpleadoModel
            {
                Rut = e.RutEmpleado,
                Dv = e.Dv,
                Nombre = e.Nombre,
                Apellido = e.Apellido,
                Direccion = e.Direccion,
                Telefono = e.Telefono,
                Activo = e.Activo,
                IdComuna = e.FkComuna,
                NombreComuna = e.FkComunaNavigation != null ? e.FkComunaNavigation.Nombre : null,
                NombreRegion = e.FkComunaNavigation != null
                               ? e.FkComunaNavigation.FkCodigoRegionNavigation.Nombre
                               : null
            };

        // GET: Empleado/
        [HttpGet]
        [Authorize(Roles = "1")]
        public async Task<ActionResult<IEnumerable<EmpleadoModel>>> GetAll([FromQuery] bool? onlyActive = null)
        {
            IQueryable<Empleado> query = _context.Empleados.AsNoTracking();

            if (onlyActive.HasValue)
            {
                query = query.Where(e => (onlyActive.Value && e.Activo == "S") || (!onlyActive.Value && e.Activo != "S"));
            }

            // Projection translated to SQL (LEFT JOINs generated automatically)
            var result = await query
                .Select(EmpleadoProjection)
                .ToListAsync();

            return Ok(result);
        }

        // GET: Empleado/{rut}
        [HttpGet("{rut}")]
        [Authorize(Roles = "1")]
        public async Task<ActionResult<EmpleadoModel>> GetByRut(string rut)
        {
            if (string.IsNullOrWhiteSpace(rut))
                return BadRequest("Rut requerido.");

            var model = await _context.Empleados
                .AsNoTracking()
                .Where(e => e.RutEmpleado == rut)
                .Select(EmpleadoProjection)
                .FirstOrDefaultAsync();

            if (model == null)
                return NotFound();

            return Ok(model);
        }

        // POST: Empleado
        [HttpPost]
        [Authorize(Roles = "1")]
        public async Task<ActionResult<EmpleadoModel>> Create([FromBody] EmpleadoModel model)
        {
            if (model == null)
                return BadRequest("Datos inválidos.");

            model.Rut = (model.Rut ?? "").Trim();
            model.Dv = (model.Dv ?? "").Trim().ToUpperInvariant();

            if (string.IsNullOrWhiteSpace(model.Rut) ||
                string.IsNullOrWhiteSpace(model.Dv) ||
                string.IsNullOrWhiteSpace(model.Nombre) ||
                string.IsNullOrWhiteSpace(model.Apellido))
            {
                return BadRequest("Rut, Dv, Nombre y Apellido son obligatorios.");
            }

            bool exists = await _context.Empleados.AnyAsync(e => e.RutEmpleado == model.Rut);
            if (exists)
                return Conflict($"Empleado con rut {model.Rut} ya existe.");

            var entity = new Empleado
            {
                RutEmpleado = model.Rut,
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

            // Return projected model (single query)
            var created = await _context.Empleados
                .AsNoTracking()
                .Where(e => e.RutEmpleado == entity.RutEmpleado)
                .Select(EmpleadoProjection)
                .FirstAsync();

            return CreatedAtAction(nameof(GetByRut), new { rut = created.Rut }, created);
        }

        // PUT: Empleado/
        [HttpPut]
        [Authorize(Roles = "1")]
        public async Task<ActionResult<EmpleadoModel>> Update([FromBody] EmpleadoModel model)
        {
            if (model == null)
                return BadRequest("Datos inválidos.");
            if (string.IsNullOrWhiteSpace(model.Rut))
                return BadRequest("Rut requerido.");

            var entity = await _context.Empleados.FirstOrDefaultAsync(e => e.RutEmpleado == model.Rut);
            if (entity == null)
                return NotFound();

            entity.Dv = model.Dv?.Trim().ToUpperInvariant() ?? entity.Dv;
            entity.Nombre = model.Nombre ?? entity.Nombre;
            entity.Apellido = model.Apellido ?? entity.Apellido;
            entity.Direccion = model.Direccion;
            entity.Telefono = model.Telefono;
            if (!string.IsNullOrWhiteSpace(model.Activo))
                entity.Activo = model.Activo;
            entity.FkComuna = model.IdComuna;

            await _context.SaveChangesAsync();

            var updated = await _context.Empleados
                .AsNoTracking()
                .Where(e => e.RutEmpleado == entity.RutEmpleado)
                .Select(EmpleadoProjection)
                .FirstAsync();

            return Ok(updated);
        }

        // DELETE: Empleado/{rut}
        [HttpDelete("{rut}")]
        [Authorize(Roles = "1")]
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

        [HttpGet("get-by-user/{correo}")]
        [Authorize(Roles = "2")]
        public async Task<ActionResult<EmpleadoApp>> GetEmpleadoByUser(string correo)
        {
            if (string.IsNullOrWhiteSpace(correo))
                return BadRequest("Correo requerido.");
            EmpleadoApp? empleado = await (from e in _context.Empleados
                                     join u in _context.Usuarios on e.RutEmpleado equals u.FkRutEmpleado
                                     where u.Correo == correo
                                     select new EmpleadoApp
                                     {
                                         Rut = e.RutEmpleado,
                                         Dv = e.Dv,
                                         Nombre = e.Nombre,
                                         Apellido = e.Apellido,
                                         Correo = u.Correo
                                     }).FirstOrDefaultAsync();
            if (empleado == null)
                return NotFound();
            else
                return Ok(empleado);
        }
    }
}
