using Microsoft.EntityFrameworkCore;
using ConSec.Models;

namespace ConSec.Data
{
  public class ApplicationDbContext : DbContext
  {
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    // Tabela de Usuários
    public DbSet<Usuario> Usuarios { get; set; }

    // NOVA TABELA de Temas de Custo
    public DbSet<TemaCusto> TemasCusto { get; set; }

    // Tabela de Custos
    public DbSet<Custo> Custos { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      base.OnModelCreating(modelBuilder);

      // Configurar relacionamento Usuario -> TemasCusto
      modelBuilder.Entity<Usuario>()
        .HasMany(u => u.TemasCusto)
        .WithOne(t => t.Usuario)
        .HasForeignKey(t => t.UsuarioId)
        .OnDelete(DeleteBehavior.SetNull);
    }
  }
}
