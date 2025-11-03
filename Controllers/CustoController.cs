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
    public class CustoController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CustoController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/custo - Listar custos do usuário logado
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CustoResponseDto>>> GetMyCustos()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var custos = await _context.Custos
                .Include(c => c.TemaCusto)
                .Include(c => c.Usuario)
                .Where(c => c.UsuarioId == userId)
                .OrderByDescending(c => c.DataPagamento)
                .Select(c => new CustoResponseDto
                {
                    Id = c.Id,
                    Descricao = c.Descricao,
                    Valor = c.Valor,
                    DataPagamento = c.DataPagamento,
                    Tipo = c.Tipo,
                    Comentario = c.Comentario,
                    ArquivoAnexoPath = c.ArquivoAnexoPath,
                    TemaCustoId = c.TemaCustoId,
                    TemaCustoNome = c.TemaCusto.Nome,
                    UsuarioId = c.UsuarioId,
                    UsuarioNome = c.Usuario.Nome,
                    UsuarioEmail = c.Usuario.Email
                })
                .ToListAsync();

            return Ok(custos);
        }

        // GET: api/custo/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CustoResponseDto>> GetById(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var isGestor = User.IsInRole("gestor");

            var custo = await _context.Custos
                .Include(c => c.TemaCusto)
                .Include(c => c.Usuario)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (custo == null)
            {
                return NotFound(new { message = "Custo não encontrado" });
            }

            // Funcionário só pode ver seus próprios custos
            if (!isGestor && custo.UsuarioId != userId)
            {
                return Forbid();
            }

            var response = new CustoResponseDto
            {
                Id = custo.Id,
                Descricao = custo.Descricao,
                Valor = custo.Valor,
                DataPagamento = custo.DataPagamento,
                Tipo = custo.Tipo,
                Comentario = custo.Comentario,
                ArquivoAnexoPath = custo.ArquivoAnexoPath,
                TemaCustoId = custo.TemaCustoId,
                TemaCustoNome = custo.TemaCusto.Nome,
                UsuarioId = custo.UsuarioId,
                UsuarioNome = custo.Usuario.Nome,
                UsuarioEmail = custo.Usuario.Email
            };

            return Ok(response);
        }

        // POST: api/custo
        [HttpPost]
        public async Task<ActionResult<CustoResponseDto>> Create([FromBody] CreateCustoDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            // Verifica se o tema existe
            var temaExists = await _context.TemasCusto.AnyAsync(t => t.Id == dto.TemaCustoId);
            if (!temaExists)
            {
                return BadRequest(new { message = "Tema de custo não encontrado" });
            }

            var custo = new Custo
            {
                Descricao = dto.Descricao,
                Valor = dto.Valor,
                DataPagamento = dto.DataPagamento,
                Tipo = dto.Tipo,
                Comentario = dto.Comentario,
                TemaCustoId = dto.TemaCustoId,
                UsuarioId = userId
            };

            _context.Custos.Add(custo);
            await _context.SaveChangesAsync();

            // Recarrega com relacionamentos
            await _context.Entry(custo).Reference(c => c.TemaCusto).LoadAsync();
            await _context.Entry(custo).Reference(c => c.Usuario).LoadAsync();

            var response = new CustoResponseDto
            {
                Id = custo.Id,
                Descricao = custo.Descricao,
                Valor = custo.Valor,
                DataPagamento = custo.DataPagamento,
                Tipo = custo.Tipo,
                Comentario = custo.Comentario,
                ArquivoAnexoPath = custo.ArquivoAnexoPath,
                TemaCustoId = custo.TemaCustoId,
                TemaCustoNome = custo.TemaCusto.Nome,
                UsuarioId = custo.UsuarioId,
                UsuarioNome = custo.Usuario.Nome,
                UsuarioEmail = custo.Usuario.Email
            };

            return CreatedAtAction(nameof(GetById), new { id = custo.Id }, response);
        }

        // PUT: api/custo/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateCustoDto dto)
        {
            if (id != dto.Id)
            {
                return BadRequest(new { message = "ID não corresponde" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var isGestor = User.IsInRole("gestor");

            var custo = await _context.Custos.FindAsync(id);

            if (custo == null)
            {
                return NotFound(new { message = "Custo não encontrado" });
            }

            // Funcionário só pode editar seus próprios custos
            if (!isGestor && custo.UsuarioId != userId)
            {
                return Forbid();
            }

            // Verifica se o tema existe
            var temaExists = await _context.TemasCusto.AnyAsync(t => t.Id == dto.TemaCustoId);
            if (!temaExists)
            {
                return BadRequest(new { message = "Tema de custo não encontrado" });
            }

            custo.Descricao = dto.Descricao;
            custo.Valor = dto.Valor;
            custo.DataPagamento = dto.DataPagamento;
            custo.Tipo = dto.Tipo;
            custo.Comentario = dto.Comentario;
            custo.TemaCustoId = dto.TemaCustoId;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Custos.AnyAsync(c => c.Id == id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/custo/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var isGestor = User.IsInRole("gestor");

            var custo = await _context.Custos.FindAsync(id);

            if (custo == null)
            {
                return NotFound(new { message = "Custo não encontrado" });
            }

            // Funcionário só pode deletar seus próprios custos
            if (!isGestor && custo.UsuarioId != userId)
            {
                return Forbid();
            }

            _context.Custos.Remove(custo);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
