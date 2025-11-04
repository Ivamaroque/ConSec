using Microsoft.EntityFrameworkCore;
using ConSec.Data;

var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
optionsBuilder.UseMySql(
    "server=localhost;port=3306;database=consec_db;user=root;password=root",
    ServerVersion.AutoDetect("server=localhost;port=3306;database=consec_db;user=root;password=root")
);

using var context = new ApplicationDbContext(optionsBuilder.Options);

Console.WriteLine("=== Verificando TemasCusto ===");
var temas = await context.Database.SqlQueryRaw<dynamic>("SELECT * FROM TemasCusto").ToListAsync();
Console.WriteLine($"Total de temas: {temas.Count}");

Console.WriteLine("\n=== Verificando Usuarios gestores ===");
var gestores = await context.Database.SqlQueryRaw<dynamic>("SELECT Id, Nome, Cargo FROM Usuarios WHERE Cargo = 'gestor'").ToListAsync();
Console.WriteLine($"Total de gestores: {gestores.Count}");

if (gestores.Count > 0)
{
    var gestorId = gestores[0].Id;
    Console.WriteLine($"\n=== Atualizando TemasCusto com gestorId: {gestorId} ===");
    
    var rowsAffected = await context.Database.ExecuteSqlRawAsync(
        $"UPDATE TemasCusto SET UsuarioId = {gestorId} WHERE UsuarioId IS NULL"
    );
    Console.WriteLine($"Linhas atualizadas: {rowsAffected}");
    
    Console.WriteLine("\n=== Criando índice ===");
    try
    {
        await context.Database.ExecuteSqlRawAsync(
            "CREATE INDEX IF NOT EXISTS IX_TemasCusto_UsuarioId ON TemasCusto (UsuarioId)"
        );
        Console.WriteLine("Índice criado com sucesso");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Índice já existe ou erro: {ex.Message}");
    }
    
    Console.WriteLine("\n=== Criando FK ===");
    try
    {
        await context.Database.ExecuteSqlRawAsync(
            "ALTER TABLE TemasCusto ADD CONSTRAINT FK_TemasCusto_Usuarios_UsuarioId FOREIGN KEY (UsuarioId) REFERENCES Usuarios (Id)"
        );
        Console.WriteLine("FK criada com sucesso");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"FK já existe ou erro: {ex.Message}");
    }
    
    Console.WriteLine("\n=== Marcando migration como aplicada ===");
    await context.Database.ExecuteSqlRawAsync(
        "INSERT IGNORE INTO __EFMigrationsHistory (MigrationId, ProductVersion) VALUES ('20251103203747_AdicionaUsuarioIdEmTemaCusto', '6.0.0')"
    );
    Console.WriteLine("Migration marcada como aplicada!");
}

Console.WriteLine("\n=== Concluído! ===");
