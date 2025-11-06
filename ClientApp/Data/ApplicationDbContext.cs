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

    // Tabela de Saldos
    public DbSet<Saldo> Saldos { get; set; } = null!;

    // Tabela de relacionamento muitos-para-muitos
    public DbSet<TemaCustoUsuario> TemasCustoUsuarios { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      base.OnModelCreating(modelBuilder);

      // Configurar relacionamento Usuario -> TemasCusto
      modelBuilder.Entity<Usuario>()
        .HasMany(u => u.TemasCusto)
        .WithOne(t => t.Usuario)
        .HasForeignKey(t => t.UsuarioId)
        .OnDelete(DeleteBehavior.SetNull);

      // Configurar relacionamento muitos-para-muitos: TemaCusto <-> Usuario
      modelBuilder.Entity<TemaCustoUsuario>()
        .HasOne(tu => tu.TemaCusto)
        .WithMany(t => t.TemaCustoUsuarios)
        .HasForeignKey(tu => tu.TemaCustoId)
        .OnDelete(DeleteBehavior.Cascade);

      modelBuilder.Entity<TemaCustoUsuario>()
        .HasOne(tu => tu.Usuario)
        .WithMany()
        .HasForeignKey(tu => tu.UsuarioId)
        .OnDelete(DeleteBehavior.Cascade);

      // Índice único para evitar duplicação: um usuário não pode ter o mesmo tema duas vezes
      modelBuilder.Entity<TemaCustoUsuario>()
        .HasIndex(tu => new { tu.TemaCustoId, tu.UsuarioId })
        .IsUnique();
    }
  }
}
