using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConSec.Data;
using ConSec.Models;
using ConSec.Models.DTOs;
using System.Security.Claims;

namespace ConSec.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TemaCustoController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TemaCustoController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/temacusto
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TemaCustoResponseDto>>> GetAll()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized();
            }

            var userId = int.Parse(userIdClaim);

            var query = _context.TemasCusto.Include(t => t.Usuario).AsQueryable();

            // Funcionários só veem seus próprios temas
            if (userRole == "funcionario")
            {
                query = query.Where(t => t.UsuarioId == userId);
            }
            // Gestor vê todos

            var temas = await query
                .Select(t => new TemaCustoResponseDto
                {
                    Id = t.Id,
                    Nome = t.Nome,
                    Descricao = t.Descricao,
                    Cor = t.Cor,
                    Icone = t.Icone ?? "label",
                    UsuarioId = t.UsuarioId ?? 0,
                    UsuarioNome = t.Usuario != null ? t.Usuario.Nome : "N/A"
                })
                .ToListAsync();

            return Ok(temas);
        }

        // GET: api/temacusto/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TemaCustoResponseDto>> GetById(int id)
        {
            var tema = await _context.TemasCusto
                .Include(t => t.Usuario)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (tema == null)
            {
                return NotFound(new { message = "Tema de custo não encontrado" });
            }

            var response = new TemaCustoResponseDto
            {
                Id = tema.Id,
                Nome = tema.Nome,
                Descricao = tema.Descricao,
                UsuarioId = tema.UsuarioId ?? 0,
                UsuarioNome = tema.Usuario?.Nome ?? "N/A"
            };

            return Ok(response);
        }

        // POST: api/temacusto
        [HttpPost]
        [Authorize(Roles = "gestor")]
        public async Task<ActionResult<TemaCustoResponseDto>> Create([FromBody] CreateTemaCustoDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Verifica se o usuário existe
            var usuario = await _context.Usuarios.FindAsync(dto.UsuarioId);
            if (usuario == null)
            {
                return BadRequest(new { message = "Usuário não encontrado" });
            }

            // Verifica se já existe um tema com esse nome para esse usuário
            if (await _context.TemasCusto.AnyAsync(t => t.Nome.ToLower() == dto.Nome.ToLower() && t.UsuarioId == dto.UsuarioId))
            {
                return BadRequest(new { message = "Já existe um tema com esse nome para este usuário" });
            }

            var tema = new TemaCusto
            {
                Nome = dto.Nome,
                Descricao = dto.Descricao,
                Cor = dto.Cor,
                Icone = dto.Icone ?? "label",
                UsuarioId = dto.UsuarioId
            };

            _context.TemasCusto.Add(tema);
            await _context.SaveChangesAsync();

            var response = new TemaCustoResponseDto
            {
                Id = tema.Id,
                Nome = tema.Nome,
                Descricao = tema.Descricao,
                Cor = tema.Cor,
                Icone = tema.Icone ?? "label",
                UsuarioId = tema.UsuarioId ?? 0,
                UsuarioNome = usuario.Nome
            };

            return CreatedAtAction(nameof(GetById), new { id = tema.Id }, response);
        }

        // PUT: api/temacusto/5
        [HttpPut("{id}")]
        [Authorize(Roles = "gestor")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateTemaCustoDto dto)
        {
            if (id != dto.Id)
            {
                return BadRequest(new { message = "ID não corresponde" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var tema = await _context.TemasCusto.FindAsync(id);

            if (tema == null)
            {
                return NotFound(new { message = "Tema de custo não encontrado" });
            }

            // Verifica se já existe outro tema com esse nome para o mesmo usuário
            var usuarioIdToCheck = dto.UsuarioId ?? tema.UsuarioId;
            if (await _context.TemasCusto.AnyAsync(t => t.Nome.ToLower() == dto.Nome.ToLower() && t.Id != id && t.UsuarioId == usuarioIdToCheck))
            {
                return BadRequest(new { message = "Já existe outro tema com esse nome para este usuário" });
            }

            tema.Nome = dto.Nome;
            tema.Descricao = dto.Descricao;
            
            if (!string.IsNullOrEmpty(dto.Cor))
            {
                tema.Cor = dto.Cor;
            }
            
            if (!string.IsNullOrEmpty(dto.Icone))
            {
                tema.Icone = dto.Icone;
            }
            
            if (dto.UsuarioId.HasValue)
            {
                // Verifica se o usuário existe
                var usuario = await _context.Usuarios.FindAsync(dto.UsuarioId.Value);
                if (usuario == null)
                {
                    return BadRequest(new { message = "Usuário não encontrado" });
                }
                tema.UsuarioId = dto.UsuarioId.Value;
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.TemasCusto.AnyAsync(t => t.Id == id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/temacusto/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "gestor")]
        public async Task<IActionResult> Delete(int id)
        {
            var tema = await _context.TemasCusto.FindAsync(id);

            if (tema == null)
            {
                return NotFound(new { message = "Tema de custo não encontrado" });
            }

            // Verifica se existem custos associados
            var temCustos = await _context.Custos.AnyAsync(c => c.TemaCustoId == id);

            if (temCustos)
            {
                return BadRequest(new { message = "Não é possível excluir um tema que possui custos associados" });
            }

            _context.TemasCusto.Remove(tema);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
