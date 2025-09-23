using GestionOT.Data;
using GestionOT.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CleanOrderAPI.Controllers
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

        public async Task<ActionResult<IEnumerable<Rol>>> GetRoles()
        {
            return await _context.Rols.ToListAsync();
        }


    }
}
