using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConSec.Models
{
    [Table("TemasCustoUsuarios")]
    public class TemaCustoUsuario
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int TemaCustoId { get; set; }

        [Required]
        public int UsuarioId { get; set; }

        // Relacionamentos
        [ForeignKey("TemaCustoId")]
        public TemaCusto TemaCusto { get; set; } = null!;

        [ForeignKey("UsuarioId")]
        public Usuario Usuario { get; set; } = null!;

        public DateTime CriadoEm { get; set; } = DateTime.Now;
    }
}
