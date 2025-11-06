using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConSec.Models
{
    public class Saldo
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Descricao { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Valor { get; set; }

        [Required]
        public DateTime DataEntrada { get; set; }

        [StringLength(500)]
        public string? ArquivoAnexoPath { get; set; }

        [Required]
        public int UsuarioId { get; set; }

        [ForeignKey("UsuarioId")]
        public Usuario? Usuario { get; set; }

        public DateTime CriadoEm { get; set; } = DateTime.Now;
    }
}
