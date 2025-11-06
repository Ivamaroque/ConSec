using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConSec.Data;
using ConSec.Models;
using ConSec.Models.DTOs;
using System.Security.Claims;

namespace ConSec.Controllers
{
    [Authorize(Roles = "gestor")]
    [ApiController]
    [Route("api/[controller]")]
    public class SaldoController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public SaldoController(ApplicationDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        // GET: api/saldo
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SaldoResponseDto>>> GetAll(
            [FromQuery] DateTime? dataInicio = null,
            [FromQuery] DateTime? dataFim = null)
        {
            var query = _context.Saldos
                .Include(s => s.Usuario)
                .AsQueryable();

            if (dataInicio.HasValue)
            {
                query = query.Where(s => s.DataEntrada >= dataInicio.Value);
            }

            if (dataFim.HasValue)
            {
                query = query.Where(s => s.DataEntrada <= dataFim.Value);
            }

            var saldos = await query
                .OrderByDescending(s => s.DataEntrada)
                .Select(s => new SaldoResponseDto
                {
                    Id = s.Id,
                    Descricao = s.Descricao,
                    Valor = s.Valor,
                    DataEntrada = s.DataEntrada,
                    ArquivoAnexoPath = s.ArquivoAnexoPath,
                    UsuarioId = s.UsuarioId,
                    UsuarioNome = s.Usuario!.Nome,
                    CriadoEm = s.CriadoEm
                })
                .ToListAsync();

            return Ok(saldos);
        }

        // GET: api/saldo/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<SaldoResponseDto>> GetById(int id)
        {
            var saldo = await _context.Saldos
                .Include(s => s.Usuario)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (saldo == null)
            {
                return NotFound(new { message = "Saldo não encontrado" });
            }

            var response = new SaldoResponseDto
            {
                Id = saldo.Id,
                Descricao = saldo.Descricao,
                Valor = saldo.Valor,
                DataEntrada = saldo.DataEntrada,
                ArquivoAnexoPath = saldo.ArquivoAnexoPath,
                UsuarioId = saldo.UsuarioId,
                UsuarioNome = saldo.Usuario!.Nome,
                CriadoEm = saldo.CriadoEm
            };

            return Ok(response);
        }

        // POST: api/saldo
        [HttpPost]
        public async Task<ActionResult<SaldoResponseDto>> Create(
            [FromForm] CreateSaldoDto dto,
            [FromForm] IFormFile? arquivoAnexo)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var saldo = new Saldo
            {
                Descricao = dto.Descricao,
                Valor = dto.Valor,
                DataEntrada = dto.DataEntrada,
                UsuarioId = userId
            };

            // Upload do arquivo, se fornecido
            if (arquivoAnexo != null && arquivoAnexo.Length > 0)
            {
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");
                Directory.CreateDirectory(uploadsFolder);

                var uniqueFileName = $"{Guid.NewGuid()}_{arquivoAnexo.FileName}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await arquivoAnexo.CopyToAsync(stream);
                }

                saldo.ArquivoAnexoPath = $"/uploads/{uniqueFileName}";
            }

            _context.Saldos.Add(saldo);
            await _context.SaveChangesAsync();

            var usuario = await _context.Usuarios.FindAsync(userId);

            var response = new SaldoResponseDto
            {
                Id = saldo.Id,
                Descricao = saldo.Descricao,
                Valor = saldo.Valor,
                DataEntrada = saldo.DataEntrada,
                ArquivoAnexoPath = saldo.ArquivoAnexoPath,
                UsuarioId = saldo.UsuarioId,
                UsuarioNome = usuario?.Nome ?? "",
                CriadoEm = saldo.CriadoEm
            };

            return CreatedAtAction(nameof(GetById), new { id = saldo.Id }, response);
        }

        // PUT: api/saldo/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult> Update(
            int id,
            [FromForm] UpdateSaldoDto dto,
            [FromForm] IFormFile? arquivoAnexo)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var saldo = await _context.Saldos.FindAsync(id);

            if (saldo == null)
            {
                return NotFound(new { message = "Saldo não encontrado" });
            }

            // Atualiza os campos se fornecidos
            if (!string.IsNullOrEmpty(dto.Descricao))
            {
                saldo.Descricao = dto.Descricao;
            }

            if (dto.Valor.HasValue)
            {
                saldo.Valor = dto.Valor.Value;
            }

            if (dto.DataEntrada.HasValue)
            {
                saldo.DataEntrada = dto.DataEntrada.Value;
            }

            // Upload de novo arquivo, se fornecido
            if (arquivoAnexo != null && arquivoAnexo.Length > 0)
            {
                // Remove arquivo antigo se existir
                if (!string.IsNullOrEmpty(saldo.ArquivoAnexoPath))
                {
                    var oldFilePath = Path.Combine(_environment.WebRootPath, saldo.ArquivoAnexoPath.TrimStart('/'));
                    if (System.IO.File.Exists(oldFilePath))
                    {
                        System.IO.File.Delete(oldFilePath);
                    }
                }

                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");
                Directory.CreateDirectory(uploadsFolder);

                var uniqueFileName = $"{Guid.NewGuid()}_{arquivoAnexo.FileName}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await arquivoAnexo.CopyToAsync(stream);
                }

                saldo.ArquivoAnexoPath = $"/uploads/{uniqueFileName}";
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/saldo/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var saldo = await _context.Saldos.FindAsync(id);

            if (saldo == null)
            {
                return NotFound(new { message = "Saldo não encontrado" });
            }

            // Remove arquivo anexo se existir
            if (!string.IsNullOrEmpty(saldo.ArquivoAnexoPath))
            {
                var filePath = Path.Combine(_environment.WebRootPath, saldo.ArquivoAnexoPath.TrimStart('/'));
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }

            _context.Saldos.Remove(saldo);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/saldo/total - Retorna o total de saldo disponível
        [HttpGet("total")]
        public async Task<ActionResult<object>> GetTotal(
            [FromQuery] DateTime? dataInicio = null,
            [FromQuery] DateTime? dataFim = null)
        {
            var query = _context.Saldos.AsQueryable();

            if (dataInicio.HasValue)
            {
                query = query.Where(s => s.DataEntrada >= dataInicio.Value);
            }

            if (dataFim.HasValue)
            {
                query = query.Where(s => s.DataEntrada <= dataFim.Value);
            }

            var totalSaldo = await query.SumAsync(s => (decimal?)s.Valor) ?? 0;

            return Ok(new { total = totalSaldo });
        }

        // GET: api/saldo/comprovante/{id}
        [HttpGet("comprovante/{id}")]
        public async Task<IActionResult> DownloadComprovante(int id)
        {
            var saldo = await _context.Saldos.FindAsync(id);

            if (saldo == null || string.IsNullOrEmpty(saldo.ArquivoAnexoPath))
            {
                return NotFound(new { message = "Comprovante não encontrado" });
            }

            var filePath = Path.Combine(_environment.WebRootPath, saldo.ArquivoAnexoPath.TrimStart('/'));

            if (!System.IO.File.Exists(filePath))
            {
                return NotFound(new { message = "Arquivo não encontrado no servidor" });
            }

            var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
            var fileName = Path.GetFileName(filePath);
            var mimeType = "application/octet-stream";

            return File(fileBytes, mimeType, fileName);
        }
    }
}
