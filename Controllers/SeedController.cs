using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConSec.Data;
using ConSec.Models;

namespace ConSec.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SeedController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SeedController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/seed/createtestusers
        [HttpGet("createtestusers")]
        public async Task<IActionResult> CreateTestUsers()
        {
            try
            {
                var usuariosCriados = new List<string>();

                // Verifica se já existe um gestor
                var gestorExiste = await _context.Usuarios.AnyAsync(u => u.Email == "admin@consec.com");

                if (!gestorExiste)
                {
                    // Cria senha hash para "admin123"
                    var senhaHash = BCrypt.Net.BCrypt.HashPassword("admin123");

                    var gestor = new Usuario
                    {
                        Nome = "Administrador",
                        Email = "admin@consec.com",
                        Senha = senhaHash,
                        Cargo = "gestor",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    _context.Usuarios.Add(gestor);
                    await _context.SaveChangesAsync();
                    usuariosCriados.Add("✅ Gestor criado - Email: admin@consec.com | Senha: admin123");
                }
                else
                {
                    usuariosCriados.Add("⚠️ Gestor já existe - Email: admin@consec.com");
                }

                // Cria um funcionário de teste
                var funcionarioExiste = await _context.Usuarios.AnyAsync(u => u.Email == "funcionario@consec.com");

                if (!funcionarioExiste)
                {
                    var senhaHash = BCrypt.Net.BCrypt.HashPassword("func123");

                    var funcionario = new Usuario
                    {
                        Nome = "João Silva",
                        Email = "funcionario@consec.com",
                        Senha = senhaHash,
                        Cargo = "funcionario",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    _context.Usuarios.Add(funcionario);
                    await _context.SaveChangesAsync();
                    usuariosCriados.Add("✅ Funcionário criado - Email: funcionario@consec.com | Senha: func123");
                }
                else
                {
                    usuariosCriados.Add("⚠️ Funcionário já existe - Email: funcionario@consec.com");
                }

                return Ok(new
                {
                    message = "Processo de seed concluído!",
                    usuarios = usuariosCriados
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
