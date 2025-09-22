using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using GestionOT.Data;
using GestionOT.Data.Entities;
using GestionOT.Services;

namespace GestionOT.Controllers
{
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly JWTService _jwtService;
        private const string JwtCookieName = "AuthToken";

        public LoginController(ApplicationDbContext context, JWTService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        [HttpPost]
        [Route("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.correo) || string.IsNullOrWhiteSpace(request.password))
            {
                return BadRequest("Correo y password son obligatorios.");
            }

            // WARNING: plain-text password check; replace with hashing in production
            Usuario? user = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Correo == request.correo && u.Password == request.password);

            if (user is null)
            {
                return Unauthorized("Correo o password invalidos.");
            }

            // Generate JWT Token
            string token = _jwtService.GenerateJwtToken(user);

            // Set HttpOnly cookie for Angular (requires HTTPS + SameSite=None)
            CookieOptions cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,                 // requires HTTPS on both API and Angular
                SameSite = SameSiteMode.None,  // allow cross-site from Angular origin
                Expires = DateTimeOffset.UtcNow.AddHours(1),
                Path = "/",
                IsEssential = true
            };

            Response.Cookies.Append(JwtCookieName, token, cookieOptions);

            // Optionally return some basic info (not the token)
            return Ok(new
            {
                correo = user.Correo,
                role = user.FkIdRol
            });
        }

        [HttpPost]
        [Route("logout")]
        public IActionResult Logout()
        {
            // Delete the auth cookie
            Response.Cookies.Delete(JwtCookieName, new CookieOptions
            {
                Path = "/",
                SameSite = SameSiteMode.None,
                Secure = true,
                HttpOnly = true
            });

            return NoContent();
        }

        // 200 if authenticated (JWT cookie valid), 401 otherwise
        [HttpGet]
        [Route("me")]
        [Authorize]
        public IActionResult Session()
        {
            ClaimsPrincipal user = HttpContext.User;
            return Ok(new
            {
                authenticated = true,
                correo = user.FindFirst(JwtRegisteredClaimNames.Sub)?.Value,
                role = user.FindFirst(ClaimTypes.Role)?.Value
            });
        }
    }

    public class LoginRequest
    {
        public required string correo { get; set; }
        public required string password { get; set; }
    }
}