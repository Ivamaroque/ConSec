using Microsoft.EntityFrameworkCore;
using ConSec.Models; // Importa a pasta onde está a sua classe Usuario

namespace ConSec.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        // Mapeia a classe 'Usuario' para uma tabela 'Usuarios' no banco.
        public DbSet<Usuario> Usuarios { get; set; } = null!;
    }
}
