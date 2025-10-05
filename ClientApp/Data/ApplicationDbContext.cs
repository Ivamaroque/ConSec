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
  }
}
