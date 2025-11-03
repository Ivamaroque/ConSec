using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConSec.Data;

namespace ConSec.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TestController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/test/checkusers
        [HttpGet("checkusers")]
        public async Task<IActionResult> CheckUsers()
        {
            try
            {
                var usuarios = await _context.Usuarios.ToListAsync();
                
                return Ok(new
                {
                    totalUsuarios = usuarios.Count,
                    usuarios = usuarios.Select(u => new
                    {
                        u.Id,
                        u.Nome,
                        u.Email,
                        u.Cargo,
                        senhaLength = u.Senha.Length
                    })
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        // GET: api/test/ping
        [HttpGet("ping")]
        public IActionResult Ping()
        {
            return Ok(new
            {
                message = "API está funcionando!",
                timestamp = DateTime.UtcNow
            });
        }
    }
}
