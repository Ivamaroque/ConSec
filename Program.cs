// ===== COLOQUE OS USINGS AQUI NO TOPO =====
using Microsoft.EntityFrameworkCore;
using ConSec.Data;
using ConSec.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Globalization;

var builder = WebApplication.CreateBuilder(args);

// ===== CONFIGURAÇÃO DE CULTURA PARA PARSING CORRETO DE DECIMAIS =====
var cultureInfo = new CultureInfo("en-US");
CultureInfo.DefaultThreadCurrentCulture = cultureInfo;
CultureInfo.DefaultThreadCurrentUICulture = cultureInfo;

// Add services to the container.
builder.Services.AddControllersWithViews();

// ===== ADICIONE A CONFIGURAÇÃO DO BANCO AQUI =====
// Pega a connection string do appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Adiciona o DbContext ao contêiner de serviços e configura para usar MySQL
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// ===== CONFIGURAÇÃO DE AUTENTICAÇÃO JWT =====
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        RoleClaimType = "cargo" // Define que o claim "cargo" será usado para roles
    };
});

builder.Services.AddAuthorization();

// ===== REGISTRAR SERVIÇOS =====
builder.Services.AddScoped<AuthService>();

// ===== CONFIGURAÇÃO DE CORS =====
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
        policy =>
        {
            policy.WithOrigins("https://localhost:44475", "http://localhost:4200")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});
// ===============================================

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles(); // Serve arquivos da pasta wwwroot

// Configuração específica para servir arquivos de upload
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads")),
    RequestPath = "/uploads"
});

app.UseRouting();

// ===== USAR CORS, AUTENTICAÇÃO E AUTORIZAÇÃO =====
app.UseCors("AllowAngularApp");
app.UseAuthentication();
app.UseAuthorization();


app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Index}/{id?}");

app.MapFallbackToFile("index.html"); ;

app.Run();