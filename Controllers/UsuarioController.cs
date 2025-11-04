using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConSec.Data;
using ConSec.Models;
using ConSec.Models.DTOs;

namespace ConSec.Controllers
{
    [Authorize(Roles = "gestor")]
    [ApiController]
    [Route("api/[controller]")]
    public class UsuarioController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsuarioController(ApplicationDbContext context)
        {
            _context = context;
        }

        // POST: api/usuario/criar-funcionario
        [HttpPost("criar-funcionario")]
        public async Task<ActionResult<UsuarioListDto>> CriarFuncionario([FromBody] CreateFuncionarioDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Verifica se já existe um usuário com esse email
            if (await _context.Usuarios.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower()))
            {
                return BadRequest(new { message = "Já existe um usuário com este email" });
            }

            // Hash da senha
            var senhaHash = BCrypt.Net.BCrypt.HashPassword(dto.Senha);

            var funcionario = new Usuario
            {
                Nome = dto.Nome,
                Email = dto.Email,
                Senha = senhaHash,
                Cargo = "funcionario" // Sempre cria como funcionário
            };

            _context.Usuarios.Add(funcionario);
            await _context.SaveChangesAsync();

            var response = new UsuarioListDto
            {
                Id = funcionario.Id,
                Nome = funcionario.Nome,
                Email = funcionario.Email
            };

            return CreatedAtAction(nameof(GetFuncionarios), response);
        }

        // GET: api/usuario/funcionarios
        [HttpGet("funcionarios")]
        public async Task<ActionResult<IEnumerable<object>>> GetFuncionarios()
        {
            var funcionarios = await _context.Usuarios
                .Where(u => u.Cargo == "funcionario")
                .Include(u => u.TemasCusto)
                .Select(u => new
                {
                    id = u.Id,
                    nome = u.Nome,
                    email = u.Email,
                    temas = u.TemasCusto.Select(t => new
                    {
                        id = t.Id,
                        nome = t.Nome,
                        cor = t.Cor,
                        icone = t.Icone
                    }).ToList()
                })
                .ToListAsync();

            return Ok(funcionarios);
        }

        // PUT: api/usuario/funcionario/{id}
        [HttpPut("funcionario/{id}")]
        public async Task<ActionResult> UpdateFuncionario(int id, [FromBody] UpdateFuncionarioDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var funcionario = await _context.Usuarios.FindAsync(id);

            if (funcionario == null)
            {
                return NotFound(new { message = "Funcionário não encontrado" });
            }

            if (funcionario.Cargo != "funcionario")
            {
                return BadRequest(new { message = "Usuário não é um funcionário" });
            }

            // Atualizar nome
            if (!string.IsNullOrEmpty(dto.Nome))
            {
                funcionario.Nome = dto.Nome;
            }

            // Atualizar email (verificar se não está em uso)
            if (!string.IsNullOrEmpty(dto.Email) && dto.Email != funcionario.Email)
            {
                if (await _context.Usuarios.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower() && u.Id != id))
                {
                    return BadRequest(new { message = "Já existe um usuário com este email" });
                }
                funcionario.Email = dto.Email;
            }

            // Atualizar senha (se fornecida)
            if (!string.IsNullOrEmpty(dto.Senha))
            {
                funcionario.Senha = BCrypt.Net.BCrypt.HashPassword(dto.Senha);
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Funcionário atualizado com sucesso" });
        }

        // DELETE: api/usuario/funcionario/{id}
        [HttpDelete("funcionario/{id}")]
        public async Task<ActionResult> DeleteFuncionario(int id)
        {
            var funcionario = await _context.Usuarios.FindAsync(id);

            if (funcionario == null)
            {
                return NotFound(new { message = "Funcionário não encontrado" });
            }

            if (funcionario.Cargo != "funcionario")
            {
                return BadRequest(new { message = "Usuário não é um funcionário" });
            }

            // Verificar se tem temas associados
            var temTemas = await _context.TemasCusto.AnyAsync(t => t.UsuarioId == id);
            if (temTemas)
            {
                return BadRequest(new { message = "Não é possível excluir funcionário com temas associados. Exclua ou transfira os temas primeiro." });
            }

            _context.Usuarios.Remove(funcionario);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Funcionário excluído com sucesso" });
        }

        // GET: api/usuario/todos (temporário para debug)
        [HttpGet("todos")]
        public async Task<ActionResult<IEnumerable<object>>> GetTodos()
        {
            var usuarios = await _context.Usuarios
                .Select(u => new
                {
                    Id = u.Id,
                    Nome = u.Nome,
                    Email = u.Email,
                    Cargo = u.Cargo
                })
                .ToListAsync();

            return Ok(usuarios);
        }
    }

    // DTO para lista de usuários
    public class UsuarioListDto
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }

    // DTO para criar funcionário
    public class CreateFuncionarioDto
    {
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Senha { get; set; } = string.Empty;
    }

    // DTO para atualizar funcionário
    public class UpdateFuncionarioDto
    {
        public string? Nome { get; set; }
        public string? Email { get; set; }
        public string? Senha { get; set; }
    }
}
