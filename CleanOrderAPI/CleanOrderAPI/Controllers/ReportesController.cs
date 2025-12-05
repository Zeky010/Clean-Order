using CleanOrderAPI.Data;
using CleanOrderAPI.Data.Entities;
using CleanOrderAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using System.Net.Http.Headers;
using System.Text;

namespace CleanOrderAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class ReportesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public ReportesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [Authorize(Roles = "2")]
        [HttpPost()]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadReport(
                                                       [FromForm] string correoUsuario,
                                                       [FromForm] int idOrden,
                                                       [FromForm] string observacion,
                                                       [FromForm] int tipoReporte,
                                                       [FromForm] string fecha,
                                                       [FromForm] List<IFormFile> imagenes)
        {
            Orden? orden = await _context.Ordens.FirstOrDefaultAsync(o => o.IdOrden == idOrden);
            Usuario? usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Correo == correoUsuario);

            if (orden == null || usuario == null)
            {
                return NotFound("Orden o Usuario no encontrado.");
            }

            // Validar la orden y el tipo de reporte
            (bool isValid, string? errorMessage) = ValidateOrdenAndReportType(orden, tipoReporte);
            if (!isValid)
            {
                return Conflict(new ReporteResponseModel
                {
                    Mensaje = errorMessage!,
                    IdReporte = -1,
                    CantidadImagenes = 0
                });
            }

            // Validar tipo de reporte
            if (tipoReporte != 1 && tipoReporte != 2)
            {
                return BadRequest(new ReporteResponseModel
                {
                    Mensaje = "Tipo de reporte inválido. Use 1 para inicio o 2 para finalización",
                    IdReporte = -1,
                    CantidadImagenes = 0
                });
            }

            ReporteModel viewModel = new ReporteModel
            {
                CorreoUsuario = correoUsuario,
                IdOrden = idOrden,
                Observacion = observacion,
                TipoReporte = tipoReporte,
                Fecha = DateTime.Now,
                Imagenes = imagenes ?? new List<IFormFile>()
            };

            Reporte reporte = new Reporte
            {
                FkIdOrden = viewModel.IdOrden,
                FkUsuario = usuario.IdUsuario,
                Observacion = viewModel.Observacion,
                FK_TIPO = viewModel.TipoReporte,
                ImagenesReportes = new List<ImagenesReporte>()
            };

            // Procesar las imágenes
            foreach (IFormFile imagen in viewModel.Imagenes)
            {
                if (imagen != null && imagen.Length > 0)
                {
                    ImagenesReporte imagenReporte = new ImagenesReporte
                    {
                        TipoMime = imagen.ContentType,
                        Archivo = await ConvertToBytes(imagen)
                    };
                    reporte.ImagenesReportes.Add(imagenReporte);
                }
            }

            // Usar transacción para garantizar atomicidad
            await using IDbContextTransaction transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Guardar el reporte en la base de datos
                _context.Reportes.Add(reporte);
                await _context.SaveChangesAsync();

                // Actualizar estado de la orden según el tipo de reporte
                switch (reporte.FK_TIPO)
                {
                    case 1: // Reporte de inicio
                        orden.FkEstado = 2; // Cambiar a "En Proceso"
                        break;
                    case 2: // Reporte de finalización
                        orden.FkEstado = 3; // Cambiar a "Finalizado"
                        break;
                }

                // Guardar cambios del estado de la orden
                await _context.SaveChangesAsync();

                // Confirmar la transacción
                await transaction.CommitAsync();

                return Ok(new ReporteResponseModel
                {
                    Mensaje = "Reporte creado exitosamente",
                    IdReporte = reporte.IdReporte,
                    CantidadImagenes = reporte.ImagenesReportes.Count
                });
            }
            catch (Exception ex)
            {
                // Revertir todos los cambios en caso de error
                await transaction.RollbackAsync();

                return StatusCode(StatusCodes.Status500InternalServerError, new ReporteResponseModel
                {
                    Mensaje = $"Error al guardar el reporte: {ex.Message}",
                    IdReporte = -1,
                    CantidadImagenes = 0
                });
            }
        }

        /// <summary>
        /// Valida que la orden tenga un estado válido y que el tipo de reporte sea correcto según el estado
        /// </summary>
        /// <param name="orden">La orden a validar</param>
        /// <param name="tipoReporte">Tipo de reporte: 1 (inicio) o 2 (finalización)</param>
        /// <returns>Tupla con resultado de validación y mensaje de error si aplica</returns>
        private (bool IsValid, string? ErrorMessage) ValidateOrdenAndReportType(Orden orden, int tipoReporte)
        {
            // Validar que la orden tenga un estado válido para reportes
            // Estado 1: Agendada, Estado 2: En proceso
            if (orden.FkEstado != 1 && orden.FkEstado != 2)
            {
                return (false,
                    $"La orden debe estar en estado Agendada (1) o En Proceso (2). Estado actual: {orden.FkEstado}");
            }

            // Validar que el tipo de reporte sea correcto según el estado de la orden
            if (tipoReporte == 1 && orden.FkEstado != 1)
            {
                return (false,
                    "Solo se puede crear un reporte de inicio cuando la orden está Agendada (estado 1)");
            }

            if (tipoReporte == 2 && orden.FkEstado != 2)
            {
                return (false,
                    "Solo se puede crear un reporte de finalización cuando la orden está En Proceso (estado 2)");
            }

            // Validación exitosa
            return (true, null);
        }

        private async Task<byte[]> ConvertToBytes(IFormFile file)
        {
            using (MemoryStream memoryStream = new MemoryStream())
            {
                await file.CopyToAsync(memoryStream);
                return memoryStream.ToArray();
            }
        }

        [Authorize(Roles = "1")]
        [HttpGet("{IdOrden}")]
        public async Task<ActionResult<List<ReporteDetalleModel>>> GetReportesByOrden(int IdOrden)
        {
            List<Reporte> reportes = await _context.Reportes
                .Include(r => r.FK_TIPONavigation)
                .Include(r => r.FkUsuarioNavigation)
                .Include(r => r.ImagenesReportes)
                .Where(r => r.FkIdOrden == IdOrden)
                .ToListAsync();

            if (reportes == null || reportes.Count == 0)
            {
                return NotFound("No se encontraron reportes para la orden especificada.");
            }

            List<ReporteDetalleModel> detalle = reportes.Select(r => new ReporteDetalleModel
            {
                IdReporte = r.IdReporte,
                Observacion = r.Observacion ?? string.Empty,
                Usuario = new UsuarioModel
                {
                    Id = r.FkUsuarioNavigation.IdUsuario,
                    Correo = r.FkUsuarioNavigation.Correo,
                    Activo = r.FkUsuarioNavigation.Activo,
                    Rol = r.FkUsuarioNavigation.FkIdRolNavigation?.Nombre ?? string.Empty,
                    RutEmpleado = r.FkUsuarioNavigation.FkRutEmpleado,
                    RolId = r.FkUsuarioNavigation.FkIdRol
                },
                TipoReporte = new ReporteTipoModel
                {
                    Codigo = r.FK_TIPO,
                    Nombre = r.FK_TIPONavigation?.NOMBRE ?? string.Empty
                },
                Imagenes = r.ImagenesReportes.Select(img => new ImagenReporteModel
                {
                    IdImagen = img.IdImgReporte,
                    TipoMime = img.TipoMime,
                    imagenBase64 = Convert.ToBase64String(img.Archivo),
                    IdReporte = img.FkIdReporte
                }).ToList()
            }).ToList();

            return Ok(detalle);
        }
    }
}
