using GameBacklog.api.Models;
using GameBacklog.api.Services; // Access to IGameStore and EfCoreGameStore so we can register them for DI
using GameBacklog.api.Data; // Access to GameBacklogDbContext (EF Core DbContext)
using GameBacklog.Api.Models;
using Microsoft.EntityFrameworkCore; // EF Core APIs like UseSqlite, DbContext options
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.Text;

// WebApplicationBuilder: sets up configuration, logging, DI container, and hosting defaults
var builder = WebApplication.CreateBuilder(args);

// Read the "DefaultConnection" string from appsettings.json (or environment variables, etc.)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Fail fast if the connection string is missing (prevents confusing EF Core errors later)
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException("DefaultConnection connection string is missing or empty.");
}

// Helpful debug output so you can confirm which DB connection string is being used
Console.WriteLine($"EF Core using connection string: {connectionString}");

// ------------------------------
// Register services (Dependency Injection container)
// ------------------------------
// Add services to the container.
// DI Related (Service Registration)
builder.Services.AddControllers(); // Registers MVC controllers (so [ApiController] + routing attributes work)
builder.Services.AddScoped<IGameStore, EfCoreGameStore>(); // DI registration: whenever something asks for IGameStore, create an EfCoreGameStore and inject it (scoped = once per HTTP request)
builder.Services.AddScoped<ILogStore, EfCoreLogStore>();
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
builder.Services.AddDbContext<GameBacklogDbContext>(options => options.UseSqlite(connectionString)); // Registers your EF Core DbContext. scoped by default (one per request). options.UseSqlite(connectionString) tells EF Core to use SQLite with your connection string.
// Framework Infrastructure (Not DI per se)
builder.Services.AddSwaggerGen(); // Registers Swagger generator so your API can produce OpenAPI docs
builder.Services.AddEndpointsApiExplorer(); // Adds minimal metadata endpoints used by Swagger/OpenAPI generation
builder.Services.AddCors(options => // Registers CORS policy so your frontend (running on localhost:5173) can call this API. Without this, the browser will block requests even if the API is running fine.
{
    options.AddPolicy("AllowFrontend", policy =>    
        policy.WithOrigins("http://localhost:5173") // only allow this origin (React/Vite dev server)
        .AllowAnyHeader() // allow headers like Content-Type
        .AllowAnyMethod()); // allow GET/POST/PUT/DELETE etc.
});

var jwtKey = builder.Configuration["Jwt:Key"]; // Read the JWT signing key from user secrets automatically since it is not in the appsettings
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

if (string.IsNullOrWhiteSpace(jwtKey))
{
    throw new InvalidOperationException(
        "Jwt:Key is missing. Configure it with dotnet user-secrets or the Jwt__Key environment variable.");
}

if (string.IsNullOrWhiteSpace(jwtIssuer) || string.IsNullOrWhiteSpace(jwtAudience))
{
    throw new InvalidOperationException("Jwt issuer and audience must be configured.");
}

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters // What needs to be true for token to be validated
        {
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,

            ValidateAudience = true,
            ValidAudience = jwtAudience,

            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)), // Needs to be converted to bytes for SymmetricSecruityKey for IssuerSigningKey to read it

            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(2)
        };
    });

builder.Services.AddAuthorization();

// Build the app: after this, the DI container is “locked” and middleware pipeline can be configured
var app = builder.Build();

// Configure the HTTP request pipeline.
// Only enable Swagger UI in development (not in production)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger(); // generates the OpenAPI JSON at /swagger/v1/swagger.json (default)
    app.UseSwaggerUI(); // hosts interactive Swagger UI at /swagger
}
// Redirect HTTP → HTTPS
app.UseHttpsRedirection();
// Enable the "AllowFrontend" CORS policy so the browser can call your API from the frontend origin
app.UseCors("AllowFrontend");
// Adds authorization middleware.
// This only matters if you have authentication/authorization configured.
app.UseAuthentication();
app.UseAuthorization();
// Maps attribute-routed controllers (your GamesController routes become active)
app.MapControllers();

// Start listening for HTTP requests (the app is now running)
app.Run();


