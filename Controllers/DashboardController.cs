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
        public async Task<ActionResult> GetResumo(
            [FromQuery] DateTime? dataInicio = null,
            [FromQuery] DateTime? dataFim = null,
            [FromQuery] int? temaCustoId = null,
            [FromQuery] int? usuarioId = null)
        {
            // Base query com filtros
            var query = _context.Custos.AsQueryable();

            if (dataInicio.HasValue)
            {
                query = query.Where(c => c.DataPagamento >= dataInicio.Value);
            }

            if (dataFim.HasValue)
            {
                query = query.Where(c => c.DataPagamento <= dataFim.Value);
            }

            if (temaCustoId.HasValue)
            {
                query = query.Where(c => c.TemaCustoId == temaCustoId.Value);
            }

            if (usuarioId.HasValue)
            {
                query = query.Where(c => c.UsuarioId == usuarioId.Value);
            }

            var totalGeral = await query.SumAsync(c => (decimal?)c.Valor) ?? 0;
            var quantidadeTotal = await query.CountAsync();

            // Custos por tema
            var porTema = await query
                .Include(c => c.TemaCusto)
                .GroupBy(c => c.TemaCustoId)
                .Select(g => new
                {
                    temaNome = g.First().TemaCusto!.Nome,
                    temaCor = g.First().TemaCusto!.Cor,
                    total = g.Sum(c => c.Valor),
                    quantidade = g.Count()
                })
                .OrderByDescending(x => x.total)
                .ToListAsync();

            // Custos por usuário
            var porUsuario = await query
                .Include(c => c.Usuario)
                .GroupBy(c => c.UsuarioId)
                .Select(g => new
                {
                    usuarioNome = g.First().Usuario!.Nome,
                    total = g.Sum(c => c.Valor),
                    quantidade = g.Count()
                })
                .OrderByDescending(x => x.total)
                .ToListAsync();

            // Custos por mês
            var porMesTemp = await query
                .GroupBy(c => new { Ano = c.DataPagamento.Year, Mes = c.DataPagamento.Month })
                .Select(g => new
                {
                    ano = g.Key.Ano,
                    mes = g.Key.Mes,
                    total = g.Sum(c => c.Valor),
                    quantidade = g.Count()
                })
                .ToListAsync();

            var porMes = porMesTemp
                .OrderBy(x => x.ano)
                .ThenBy(x => x.mes)
                .Select(x => new
                {
                    mes = x.mes.ToString().PadLeft(2, '0') + "/" + x.ano,
                    total = x.total,
                    quantidade = x.quantidade
                })
                .ToList();

            return Ok(new
            {
                totalGeral,
                quantidadeTotal,
                porTema,
                porUsuario,
                porMes
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
                    TemaCustoCor = c.TemaCusto!.Cor,
                    UsuarioId = c.UsuarioId,
                    UsuarioNome = c.Usuario!.Nome,
                    UsuarioEmail = c.Usuario.Email
                })
                .ToListAsync();

            return Ok(custos);
        }
    }
}
