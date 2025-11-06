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

            var query = _context.TemasCusto
                .Include(t => t.Usuario)
                .Include(t => t.TemaCustoUsuarios)
                    .ThenInclude(tu => tu.Usuario)
                .AsQueryable();

            // Funcionários só veem seus próprios temas (nova lógica com relacionamento muitos-para-muitos)
            if (userRole == "funcionario")
            {
                query = query.Where(t => 
                    t.UsuarioId == userId || // Compatibilidade com estrutura antiga
                    t.TemaCustoUsuarios.Any(tu => tu.UsuarioId == userId) // Nova estrutura
                );
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
                    UsuarioNome = t.Usuario != null ? t.Usuario.Nome : "N/A",
                    Usuarios = t.TemaCustoUsuarios.Select(tu => new UsuarioSimplificadoDto
                    {
                        Id = tu.Usuario.Id,
                        Nome = tu.Usuario.Nome,
                        Email = tu.Usuario.Email
                    }).ToList()
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

            // Determina quais IDs de usuário usar (novo ou antigo formato)
            var usuarioIds = dto.UsuarioIds ?? (dto.UsuarioId.HasValue ? new List<int> { dto.UsuarioId.Value } : new List<int>());

            if (usuarioIds.Count == 0)
            {
                return BadRequest(new { message = "Pelo menos um usuário deve ser selecionado" });
            }

            // Verifica se todos os usuários existem
            var usuarios = await _context.Usuarios.Where(u => usuarioIds.Contains(u.Id)).ToListAsync();
            if (usuarios.Count != usuarioIds.Count)
            {
                return BadRequest(new { message = "Um ou mais usuários não foram encontrados" });
            }

            var tema = new TemaCusto
            {
                Nome = dto.Nome,
                Descricao = dto.Descricao,
                Cor = dto.Cor,
                Icone = dto.Icone ?? "label"
            };

            _context.TemasCusto.Add(tema);
            await _context.SaveChangesAsync();

            // Adiciona relacionamentos na tabela intermediária
            foreach (var usuarioId in usuarioIds)
            {
                var relacao = new TemaCustoUsuario
                {
                    TemaCustoId = tema.Id,
                    UsuarioId = usuarioId
                };
                _context.TemasCustoUsuarios.Add(relacao);
            }

            await _context.SaveChangesAsync();

            // Carrega o tema com os usuários para retornar
            var temaComUsuarios = await _context.TemasCusto
                .Include(t => t.TemaCustoUsuarios)
                    .ThenInclude(tu => tu.Usuario)
                .FirstAsync(t => t.Id == tema.Id);

            var response = new TemaCustoResponseDto
            {
                Id = temaComUsuarios.Id,
                Nome = temaComUsuarios.Nome,
                Descricao = temaComUsuarios.Descricao,
                Cor = temaComUsuarios.Cor,
                Icone = temaComUsuarios.Icone ?? "label",
                UsuarioId = usuarios.First().Id, // Compatibilidade
                UsuarioNome = usuarios.First().Nome, // Compatibilidade
                Usuarios = temaComUsuarios.TemaCustoUsuarios.Select(tu => new UsuarioSimplificadoDto
                {
                    Id = tu.Usuario.Id,
                    Nome = tu.Usuario.Nome,
                    Email = tu.Usuario.Email
                }).ToList()
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

            var tema = await _context.TemasCusto
                .Include(t => t.TemaCustoUsuarios)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (tema == null)
            {
                return NotFound(new { message = "Tema de custo não encontrado" });
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

            // Atualiza relacionamentos com usuários se fornecido
            if (dto.UsuarioIds != null && dto.UsuarioIds.Count > 0)
            {
                // Remove relacionamentos antigos
                var relacionamentosAntigos = tema.TemaCustoUsuarios.ToList();
                _context.TemasCustoUsuarios.RemoveRange(relacionamentosAntigos);

                // Adiciona novos relacionamentos
                foreach (var usuarioId in dto.UsuarioIds)
                {
                    var relacao = new TemaCustoUsuario
                    {
                        TemaCustoId = tema.Id,
                        UsuarioId = usuarioId
                    };
                    _context.TemasCustoUsuarios.Add(relacao);
                }
            }
            else if (dto.UsuarioId.HasValue) // Compatibilidade com formato antigo
            {
                // Remove relacionamentos antigos
                var relacionamentosAntigos = tema.TemaCustoUsuarios.ToList();
                _context.TemasCustoUsuarios.RemoveRange(relacionamentosAntigos);

                // Adiciona novo relacionamento único
                var relacao = new TemaCustoUsuario
                {
                    TemaCustoId = tema.Id,
                    UsuarioId = dto.UsuarioId.Value
                };
                _context.TemasCustoUsuarios.Add(relacao);
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
