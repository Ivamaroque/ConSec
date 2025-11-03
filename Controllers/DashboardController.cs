using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConSec.Data;
using ConSec.Models.DTOs;

namespace ConSec.Controllers
{
    [Authorize(Roles = "gestor")]
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DashboardController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/dashboard/resumo
        [HttpGet("resumo")]
        public async Task<ActionResult> GetResumo()
        {
            var totalCustos = await _context.Custos.CountAsync();
            var valorTotal = await _context.Custos.SumAsync(c => (decimal?)c.Valor) ?? 0;
            var totalTemas = await _context.TemasCusto.CountAsync();
            var totalUsuarios = await _context.Usuarios.CountAsync(u => u.Cargo == "funcionario");

            // Custos por tema
            var custosPorTema = await _context.TemasCusto
                .Select(t => new
                {
                    TemaId = t.Id,
                    TemaNome = t.Nome,
                    TotalCustos = _context.Custos.Count(c => c.TemaCustoId == t.Id),
                    ValorTotal = _context.Custos
                        .Where(c => c.TemaCustoId == t.Id)
                        .Sum(c => (decimal?)c.Valor) ?? 0
                })
                .Where(x => x.TotalCustos > 0)
                .OrderByDescending(x => x.ValorTotal)
                .ToListAsync();

            // Custos por usuário
            var custosPorUsuario = await _context.Usuarios
                .Where(u => u.Cargo == "funcionario")
                .Select(u => new
                {
                    UsuarioId = u.Id,
                    UsuarioNome = u.Nome,
                    UsuarioEmail = u.Email,
                    TotalCustos = _context.Custos.Count(c => c.UsuarioId == u.Id),
                    ValorTotal = _context.Custos
                        .Where(c => c.UsuarioId == u.Id)
                        .Sum(c => (decimal?)c.Valor) ?? 0
                })
                .Where(x => x.TotalCustos > 0)
                .OrderByDescending(x => x.ValorTotal)
                .ToListAsync();

            // Custos por mês (últimos 6 meses)
            var seisMesesAtras = DateTime.Now.AddMonths(-6);
            var custosPorMes = await _context.Custos
                .Where(c => c.DataPagamento >= seisMesesAtras)
                .GroupBy(c => new { Ano = c.DataPagamento.Year, Mes = c.DataPagamento.Month })
                .Select(g => new
                {
                    Ano = g.Key.Ano,
                    Mes = g.Key.Mes,
                    TotalCustos = g.Count(),
                    ValorTotal = g.Sum(c => c.Valor)
                })
                .OrderBy(x => x.Ano).ThenBy(x => x.Mes)
                .ToListAsync();

            return Ok(new
            {
                resumoGeral = new
                {
                    totalCustos,
                    valorTotal,
                    totalTemas,
                    totalFuncionarios = totalUsuarios
                },
                custosPorTema,
                custosPorUsuario,
                custosPorMes
            });
        }

        // GET: api/dashboard/custos - Todos os custos (para o gestor)
        [HttpGet("custos")]
        public async Task<ActionResult<IEnumerable<CustoResponseDto>>> GetAllCustos(
            [FromQuery] int? temaCustoId = null,
            [FromQuery] int? usuarioId = null,
            [FromQuery] DateTime? dataInicio = null,
            [FromQuery] DateTime? dataFim = null)
        {
            var query = _context.Custos
                .Include(c => c.TemaCusto)
                .Include(c => c.Usuario)
                .AsQueryable();

            // Filtros opcionais
            if (temaCustoId.HasValue)
            {
                query = query.Where(c => c.TemaCustoId == temaCustoId.Value);
            }

            if (usuarioId.HasValue)
            {
                query = query.Where(c => c.UsuarioId == usuarioId.Value);
            }

            if (dataInicio.HasValue)
            {
                query = query.Where(c => c.DataPagamento >= dataInicio.Value);
            }

            if (dataFim.HasValue)
            {
                query = query.Where(c => c.DataPagamento <= dataFim.Value);
            }

            var custos = await query
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
                    TemaCustoNome = c.TemaCusto!.Nome,
                    UsuarioId = c.UsuarioId,
                    UsuarioNome = c.Usuario!.Nome,
                    UsuarioEmail = c.Usuario.Email
                })
                .ToListAsync();

            return Ok(custos);
        }
    }
}
