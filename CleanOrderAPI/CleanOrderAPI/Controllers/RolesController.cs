using CleanOrderAPI.Models;
using GestionOT.Data;
using GestionOT.Data.Entities;
using GestionOT.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestionOT.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [Authorize]
    public class RolesController : ControllerBase
    { 
        private readonly ApplicationDbContext _context;
        public RolesController(ApplicationDbContext context) 
        {
            _context = context;
        }
        [HttpGet]
        [Authorize(Roles = "1")]
        public async Task<ActionResult<IEnumerable<RolModel>>> GetRoles()
        {
            List<Rol> roles = await _context.Rols.ToListAsync();
            List<RolModel> rolModels = roles.Select(r => new RolModel
            {
                id = r.IdRol,
                nombre = r.Nombre
            }).ToList();
            return rolModels;
        }


    }
}
