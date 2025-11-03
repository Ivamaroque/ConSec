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
            var temas = await _context.TemasCusto
                .Select(t => new TemaCustoResponseDto
                {
                    Id = t.Id,
                    Nome = t.Nome,
                    TotalCustos = _context.Custos.Count(c => c.TemaCustoId == t.Id),
                    ValorTotal = _context.Custos
                        .Where(c => c.TemaCustoId == t.Id)
                        .Sum(c => (decimal?)c.Valor) ?? 0
                })
                .ToListAsync();

            return Ok(temas);
        }

        // GET: api/temacusto/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TemaCustoResponseDto>> GetById(int id)
        {
            var tema = await _context.TemasCusto.FindAsync(id);

            if (tema == null)
            {
                return NotFound(new { message = "Tema de custo não encontrado" });
            }

            var response = new TemaCustoResponseDto
            {
                Id = tema.Id,
                Nome = tema.Nome,
                TotalCustos = await _context.Custos.CountAsync(c => c.TemaCustoId == tema.Id),
                ValorTotal = await _context.Custos
                    .Where(c => c.TemaCustoId == tema.Id)
                    .SumAsync(c => (decimal?)c.Valor) ?? 0
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

            // Verifica se já existe um tema com esse nome
            if (await _context.TemasCusto.AnyAsync(t => t.Nome.ToLower() == dto.Nome.ToLower()))
            {
                return BadRequest(new { message = "Já existe um tema com esse nome" });
            }

            var tema = new TemaCusto
            {
                Nome = dto.Nome
            };

            _context.TemasCusto.Add(tema);
            await _context.SaveChangesAsync();

            var response = new TemaCustoResponseDto
            {
                Id = tema.Id,
                Nome = tema.Nome,
                TotalCustos = 0,
                ValorTotal = 0
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

            // Verifica se já existe outro tema com esse nome
            if (await _context.TemasCusto.AnyAsync(t => t.Nome.ToLower() == dto.Nome.ToLower() && t.Id != id))
            {
                return BadRequest(new { message = "Já existe outro tema com esse nome" });
            }

            tema.Nome = dto.Nome;

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
