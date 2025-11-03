using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using ConSec.Data;
using ConSec.Models;
using ConSec.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace ConSec.Services
{
    public class AuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // Método para registrar um novo usuário
        public async Task<AuthResponseDto?> RegisterAsync(RegisterDto registerDto)
        {
            // Verifica se o email já existe
            if (await _context.Usuarios.AnyAsync(u => u.Email == registerDto.Email))
            {
                return null; // Email já cadastrado
            }

            // Cria o hash da senha
            var senhaHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Senha);

            // Cria o novo usuário
            var usuario = new Usuario
            {
                Nome = registerDto.Nome,
                Email = registerDto.Email,
                Senha = senhaHash,
                Cargo = registerDto.Cargo,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            // Gera o token JWT
            var token = GenerateJwtToken(usuario);
            var expiresAt = DateTime.UtcNow.AddDays(7);

            return new AuthResponseDto
            {
                Token = token,
                Id = usuario.Id,
                Nome = usuario.Nome,
                Email = usuario.Email,
                Cargo = usuario.Cargo,
                ExpiresAt = expiresAt
            };
        }

        // Método para fazer login
        public async Task<AuthResponseDto?> LoginAsync(LoginDto loginDto)
        {
            // Busca o usuário pelo email
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (usuario == null)
            {
                return null; // Usuário não encontrado
            }

            // Verifica a senha
            if (!BCrypt.Net.BCrypt.Verify(loginDto.Senha, usuario.Senha))
            {
                return null; // Senha incorreta
            }

            // Gera o token JWT
            var token = GenerateJwtToken(usuario);
            var expiresAt = DateTime.UtcNow.AddDays(7);

            return new AuthResponseDto
            {
                Token = token,
                Id = usuario.Id,
                Nome = usuario.Nome,
                Email = usuario.Email,
                Cargo = usuario.Cargo,
                ExpiresAt = expiresAt
            };
        }

        // Método privado para gerar o token JWT
        private string GenerateJwtToken(Usuario usuario)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"];
            var issuer = jwtSettings["Issuer"];
            var audience = jwtSettings["Audience"];

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, usuario.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, usuario.Email),
                new Claim("nome", usuario.Nome),
                new Claim("cargo", usuario.Cargo),
                new Claim(ClaimTypes.Role, usuario.Cargo), // Adiciona role claim
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
