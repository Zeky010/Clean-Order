using GestionOT.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using GestionOT.Services;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register ApplicationDbContext with MySQL
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        new MySqlServerVersion(new Version(10, 4, 32)),
           mySqlOptions => mySqlOptions.EnableStringComparisonTranslations()
       ));

builder.Services.AddSingleton<JWTService>();
builder.Services.AddScoped<PasswordService>();
// CORS for Angular dev app (must match your front-end origin)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularDevClient", policy =>
    {
        policy.WithOrigins(
                "http://localhost:4200", "https://localhost:4200"
            // add more origins as needed
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Configure JWT Authentication (read from cookie)
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var key = Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!);
const string JwtCookieName = "AuthToken";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            // Pull token from cookie
            if (context.Request.Cookies.TryGetValue(JwtCookieName, out var token))
            {
                context.Token = token;
            }
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            // Sliding refresh when < 10 minutes remain
            if (context.SecurityToken is JwtSecurityToken jwt)
            {
                var remaining = jwt.ValidTo.ToUniversalTime() - DateTime.UtcNow;
                if (remaining < TimeSpan.FromMinutes(10))
                {
                    var jwtService = context.HttpContext.RequestServices.GetRequiredService<JWTService>();

                    var correo = context.Principal?.FindFirst(JwtRegisteredClaimNames.Sub)?.Value ?? "";
                    var userIdStr = context.Principal?.FindFirst("UserId")?.Value ?? "0";
                    var roleStr = context.Principal?.FindFirst(ClaimTypes.Role)?.Value ?? "0";
                    int.TryParse(userIdStr, out var userId);
                    int.TryParse(roleStr, out var roleId);

                    var newToken = jwtService.GenerateJwtToken(new GestionOT.Data.Entities.Usuario
                    {
                        IdUsuario = userId,
                        Correo = correo,
                        FkIdRol = roleId,
                        Password = "",
                        Activo = 1
                    });

                    context.Response.Cookies.Append(JwtCookieName, newToken, new CookieOptions
                    {
                        HttpOnly = true,
                        Secure = true,
                        SameSite = SameSiteMode.None,
                        Expires = DateTimeOffset.UtcNow.AddHours(1),
                        Path = "/",
                        IsEssential = true
                    });
                }
            }
            return Task.CompletedTask;
        }
    };

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key),
        RoleClaimType = ClaimTypes.Role
    };
});

builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

//CORS must be before auth
app.UseCors("AngularDevClient");

// Use Authentication and Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
