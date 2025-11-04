using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConSec.Data;

namespace ConSec.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DatabaseFixController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DatabaseFixController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("fix-temacusto")]
        public async Task<IActionResult> FixTemaCusto()
        {
            try
            {
                var result = new
                {
                    steps = new List<string>()
                };

                // 1. Verificar se a coluna UsuarioId existe
                var columnExists = await _context.Database.ExecuteSqlRawAsync(@"
                    SELECT COUNT(*) 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = 'TemasCusto' 
                    AND COLUMN_NAME = 'UsuarioId';
                ");
                result.steps.Add($"Coluna UsuarioId existe: verificado");

                // 2. Buscar um gestor para atribuir aos temas
                var gestor = await _context.Usuarios
                    .Where(u => u.Cargo == "gestor")
                    .FirstOrDefaultAsync();

                if (gestor == null)
                {
                    return BadRequest("Nenhum gestor encontrado no sistema");
                }

                result.steps.Add($"Gestor encontrado: {gestor.Nome} (ID: {gestor.Id})");

                // 3. Atualizar temas sem UsuarioId
                var rowsUpdated = await _context.Database.ExecuteSqlRawAsync(
                    $"UPDATE TemasCusto SET UsuarioId = {gestor.Id} WHERE UsuarioId IS NULL"
                );
                result.steps.Add($"Temas atualizados: {rowsUpdated}");

                // 4. Criar índice se não existir
                try
                {
                    await _context.Database.ExecuteSqlRawAsync(
                        "CREATE INDEX IX_TemasCusto_UsuarioId ON TemasCusto (UsuarioId);"
                    );
                    result.steps.Add("Índice criado com sucesso");
                }
                catch
                {
                    result.steps.Add("Índice já existe");
                }

                // 5. Criar FK se não existir
                try
                {
                    await _context.Database.ExecuteSqlRawAsync(@"
                        ALTER TABLE TemasCusto 
                        ADD CONSTRAINT FK_TemasCusto_Usuarios_UsuarioId 
                        FOREIGN KEY (UsuarioId) REFERENCES Usuarios (Id);
                    ");
                    result.steps.Add("Foreign Key criada com sucesso");
                }
                catch
                {
                    result.steps.Add("Foreign Key já existe");
                }

                // 6. Marcar migration como aplicada
                try
                {
                    await _context.Database.ExecuteSqlRawAsync(@"
                        INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion)
                        VALUES ('20251103203747_AdicionaUsuarioIdEmTemaCusto', '6.0.0');
                    ");
                    result.steps.Add("Migration marcada como aplicada");
                }
                catch
                {
                    result.steps.Add("Migration já estava aplicada");
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message, details = ex.InnerException?.Message });
            }
        }
    }
}
